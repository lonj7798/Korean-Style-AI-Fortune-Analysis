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

## 🚀 How to Run Locally

This project uses modern JavaScript (TypeScript and React) and requires an environment variable to handle the Google Gemini API key securely. The following instructions guide you on setting up a local development environment using [Vite](https://vitejs.dev/) to run the application.

### Prerequisites

-   [Git](https://git-scm.com/) for cloning the repository.
-   [Node.js](https://nodejs.org/) (version 18 or higher), which includes `npm`.
-   A Google Gemini API Key. You can get one for free from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Step 1: Clone the Repository

First, clone this repository to your local machine using git.

```bash
# Replace the URL with the actual repository URL
git clone https://github.com/your-username/ai-fortune-analysis.git
cd ai-fortune-analysis
```

### Step 2: Configure Your API Key

The application is designed to read the API key from environment variables for security.

1.  In the root of the project directory you just cloned, create a new file named `.env.local`.
2.  Add your API key to this file as follows:

    ```
    VITE_GEMINI_API_KEY="YOUR_API_KEY_HERE"
    ```

    *Replace `YOUR_API_KEY_HERE` with your actual Gemini API key.*

### Step 3: Set Up the Project

We will use `npm` to install a simple development server and its dependencies.

1.  Initialize a `package.json` file to manage dependencies:
    ```bash
    npm init -y
    ```
2.  Install Vite and the React plugin:
    ```bash
    npm install --save-dev vite @vitejs/plugin-react
    ```
3.  Add a `dev` script to your `package.json` file for convenience. Open the file and add the `"scripts"` section:
    ```json
    {
      "name": "ai-fortune-analysis",
      "private": true,
      "version": "1.0.0",
      "scripts": {
        "dev": "vite"
      },
      "devDependencies": {
        "@vitejs/plugin-react": "^4.2.1",
        "vite": "^5.2.0"
      }
    }
    ```
    *(Note: Your installed package versions might be slightly different).*

### Step 4: Create Vite Configuration

The application code expects the API key at `process.env.API_KEY`. We need to configure Vite to provide this variable from the `.env.local` file you created.

1.  Create a file named `vite.config.js` in the project root.
2.  Add the following configuration to it. This tells Vite to expose your key to the application in the expected format.

    ```javascript
    import { defineConfig, loadEnv } from 'vite';
    import react from '@vitejs/plugin-react';

    export default defineConfig(({ mode }) => {
      // Load env file based on `mode` in the current working directory.
      const env = loadEnv(mode, process.cwd(), '');
      return {
        plugins: [react()],
        // This makes the VITE_GEMINI_API_KEY from your .env file
        // available as process.env.API_KEY in your app.
        define: {
          'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
        },
      };
    });
    ```

### Step 5: Launch the App

Now you are ready to run the application.

1.  Execute the following command in your terminal:
    ```bash
    npm run dev
    ```
2.  Vite will start the server and print a local URL (e.g., `http://localhost:5173`).
3.  Open this URL in your web browser to use the AI Fortune Analysis app.

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
