import { GoogleGenAI, Type } from "@google/genai";
import { UserInput, FortuneResult, CategoryKey, Locale } from '../types';
import { getCategories, getPromptSystemInstruction } from '../locales';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  // In a real app, you'd handle this more gracefully.
  // For this environment, we assume it's set.
  console.warn("API_KEY environment variable not set.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY! });

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });
};

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    category: {
      type: Type.STRING,
      description: 'The name of the analyzed fortune category',
    },
    summary: {
      type: Type.STRING,
      description: 'A 2-3 sentence summary of the fortune analysis results',
    },
    details: {
      type: Type.STRING,
      description: 'A detailed explanation of the fortune analysis, including "### Detailed Analysis", "### Advice", and "### Limitations of Interpretation" sections.',
    },
  },
  required: ['category', 'summary', 'details'],
};

export async function analyzeFortuneCategory(
  categoryKey: CategoryKey,
  userInput: UserInput,
  locale: Locale,
  base64Image?: string,
  mimeType?: string
): Promise<FortuneResult> {
  const categories = getCategories(locale);
  const categoryName = categories[categoryKey].name;
  const systemInstruction = getPromptSystemInstruction(locale);

  const userContextPrompts: Record<Locale, (input: UserInput, hasImage: boolean) => string> = {
    ko: (input, hasImage) => `
- 이름: ${input.name}
- 생년월일: ${input.dob}
- 태어난 시간: ${input.tob || '알 수 없음'}
${hasImage ? `- 제공된 얼굴 사진의 인상을 바탕으로 관상학적 특징을 보조적으로 참고해주세요.` : ''}`,
    en: (input, hasImage) => `
- Name: ${input.name}
- Date of Birth: ${input.dob}
- Time of Birth: ${input.tob || 'Unknown'}
${hasImage ? `- As a secondary reference, please consider the physiognomic features based on the provided face photo.` : ''}`,
    zh: (input, hasImage) => `
- 姓名: ${input.name}
- 出生日期: ${input.dob}
- 出生时间: ${input.tob || '未知'}
${hasImage ? `- 作为辅助参考，请根据提供的面部照片的印象来考虑面相特征。` : ''}`,
  };

  const mainPrompts: Record<Locale, (categoryName: string) => string> = {
    ko: (cn) => `
요청:
'${cn}' 카테고리에 대해 운세 분석을 수행해주세요. 

결과는 다음 두 필드를 포함한 JSON 형식이어야 합니다:
1. 'summary': 2-3 문장의 핵심 요약.
2. 'details': 아래의 세부 섹션을 포함하는 상세 설명. 각 섹션은 '### 제목' 형식으로 시작해야 합니다.

### 상세 분석
- 사용자의 정보를 기반으로 한 구체적인 해석을 제공해주세요.

### 조언
- 분석 결과를 바탕으로 삶에 도움이 될 만한 긍정적이고 실천적인 조언을 해주세요.

### 해석의 한계
- 이 분석이 통계나 전통에 기반한 해석일 뿐, 절대적인 미래를 보장하지 않는다는 점과 같은 한계점을 명확히 언급해주세요.`,
    en: (cn) => `
Request:
Please perform a fortune analysis for the '${cn}' category.

The result must be in JSON format with the following two fields:
1. 'summary': A 2-3 sentence core summary.
2. 'details': A detailed explanation including the subsections below. Each section must start with '### Title' format.

### Detailed Analysis
- Provide a specific interpretation based on the user's information.

### Advice
- Offer positive and practical advice that could be helpful in life, based on the analysis.

### Limitations of Interpretation
- Clearly state the limitations, such as this analysis being based on statistics or tradition and not guaranteeing an absolute future.`,
    zh: (cn) => `
请求:
请对'${cn}'类别进行运势分析。

结果必须是包含以下两个字段的JSON格式:
1. 'summary': 2-3句话的核心摘要。
2. 'details': 包含以下分节的详细说明。每个分节必须以'### 标题'的格式开始。

### 详细分析
- 根据用户信息提供具体的解读。

### 建议
- 基于分析结果，提供对生活有益的积极和实用的建议。

### 解读的局限性
- 明确说明此分析的局限性，例如它仅基于统计或传统，并不能保证绝对的未来。`,
  };

  const userContext = userContextPrompts[locale](userInput, !!base64Image);
  const prompt = `
    ${locale === 'ko' ? '사용자 정보:' : locale === 'en' ? 'User Information:' : '用户信息:'}
    ${userContext}

    ${mainPrompts[locale](categoryName)}
  `;

  const contents = base64Image && mimeType 
    ? { parts: [ { text: prompt }, { inlineData: { data: base64Image, mimeType } } ] }
    : prompt;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.7,
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText) as FortuneResult;
    return result;
  } catch (error) {
    console.error(`Error analyzing category ${categoryName}:`, error);
    // The error object might be complex, so we serialize it to get a meaningful message
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
    throw new Error(`Error during '${categoryName}' analysis: ${errorMessage}`);
  }
}

export async function startBatchAnalysis(
  userInput: UserInput,
  locale: Locale,
  onStartCategory: (key: CategoryKey) => void,
  onCompleteCategory: (key: CategoryKey, result: FortuneResult | Error) => void
) {
  let base64Image: string | undefined;
  let mimeType: string | undefined;

  if (userInput.facePhoto) {
    try {
      base64Image = await fileToBase64(userInput.facePhoto);
      mimeType = userInput.facePhoto.type;
    } catch (error) {
      console.error("Error converting image to base64", error);
      // Proceed without the image if conversion fails
    }
  }
  
  const categories = getCategories(locale);
  const categoryKeys = Object.keys(categories) as CategoryKey[];

  for (const key of categoryKeys) {
    try {
      onStartCategory(key);
      const result = await analyzeFortuneCategory(key, userInput, locale, base64Image, mimeType);
      onCompleteCategory(key, result);
    } catch (error) {
      onCompleteCategory(key, error as Error);
    }
  }
}