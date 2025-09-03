# AI Fortune Analysis (AI 운세 분석)

This web application provides a personalized fortune analysis based on user-provided information, powered by the Google Gemini API. It analyzes a user's name, date of birth, optional time of birth, and an optional face photo to generate insights across eight different life categories. The results are presented in a beautiful and interactive interface featuring flippable cards and a detailed modal view.

![AI Fortune Teller Screenshot](https://storage.googleapis.com/aistudio-hosting/generative-ai-samples/public/github-readme-assets/fortune-teller.png)

## ✨ Key Features

-   **Comprehensive 8-Category Analysis**: Generates detailed fortune readings for categories including Four Pillars, Personality, Overall Life, Wealth, Career, Love, and Health.
-   **Personalized Inputs**: Utilizes name, date/time of birth, and an optional face photo (for physiognomy analysis) to tailor the results.
-   **Interactive & Engaging UI**: Features a dynamic card-flipping animation to reveal summaries and a clean, navigable modal for detailed explanations.
-   **Real-time Progress Tracking**: Users can watch as each category is analyzed in real-time, with clear status indicators for pending, analyzing, completed, or failed states.
-   **Multilingual Support**: Fully localized in Korean, English, and Chinese, allowing users to switch languages seamlessly.
-   **Modern & Responsive Design**: Built with Tailwind CSS for a sleek, mobile-first experience that looks great on any device.
-   **Powered by Google Gemini**: Leverages the advanced capabilities of the `gemini-2.5-flash` model for high-quality, structured JSON output.

## 🚀 Tech Stack

-   **Frontend**: [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
-   **AI Model**: Google Gemini API ([@google/genai](https://www.npmjs.com/package/@google/genai))
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Language Management**: React Context API

## ⚙️ Getting Started

### Prerequisites

-   A modern web browser.
-   A Google Gemini API Key. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Running the Application

This project is designed to run in a web-based development environment where the Gemini API key is securely managed as an environment variable (`process.env.API_KEY`).

1.  **Provide API Key**: Ensure the `API_KEY` environment variable is set in your deployment or development environment.
2.  **Open `index.html`**: The application will start, and the necessary scripts will be imported via the import map.

## 📂 Project Structure

```
.
├── components/          # Reusable React components
│   ├── DetailModal.tsx      # Modal for displaying detailed analysis
│   ├── FortuneCard.tsx      # Flippable card for each category summary
│   ├── GenerationProgress.tsx # UI for showing analysis progress
│   ├── Header.tsx           # App header with language selector
│   ├── icons.tsx            # SVG icons for categories
│   └── InputForm.tsx        # Form for user data input
├── contexts/            # React Context for global state
│   └── LanguageContext.tsx  # Manages locale and translations
├── services/            # Modules for external interactions
│   └── geminiService.ts     # Handles all calls to the Gemini API
├── App.tsx              # Main application component, manages state and pages
├── index.html           # The main HTML file
├── index.tsx            # Entry point for the React application
├── locales.ts           # Contains all UI translations and category definitions
├── types.ts             # TypeScript type definitions
└── README.md            # You are here!
```

## 🧠 How It Works

1.  **User Input**: The `InputForm` component collects the user's name, date of birth, time of birth, and an optional face photo.
2.  **Batch Analysis**: Upon submission, the `App` component triggers the `startBatchAnalysis` function in `geminiService.ts`.
3.  **Concurrent API Calls**: The service iterates through all 8 fortune categories. For each category, it constructs a detailed prompt including the user's information and a system instruction. If a photo is provided, it's converted to base64 and included in the request.
4.  **Structured Output**: The prompt requests a specific JSON schema from the Gemini API (`gemini-2.5-flash`), ensuring the response contains a `summary` and `details`.
5.  **Real-time Feedback**: As each API call starts and completes (or fails), the `geminiService` uses callback functions (`onStartCategory`, `onCompleteCategory`) to update the UI state in real-time. The `GenerationProgress` component visualizes this state.
6.  **Displaying Results**: Once all analyses are complete, the app navigates to the `ResultsDisplay` page. The results are rendered as a grid of `FortuneCard` components. Clicking a card flips it to show the summary and opens a `DetailModal` with the full, formatted analysis.
7.  **Localization**: The `LanguageContext` provides a `t` function that pulls strings from the `locales.ts` file based on the currently selected language, making UI text, prompts, and category names fully translatable.
