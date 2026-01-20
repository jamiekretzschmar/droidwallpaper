# DroidTheme AI

A futuristic Android theme generator powered by Google's Gemini models.

## Features

- **AI Theme Generation**: Describe your desired aesthetic, and the app generates a complete color palette and wallpaper prompt.
- **Generative Wallpapers**: 
  - **Standard**: Uses Gemini 2.5 Flash Image.
  - **High Quality**: Uses Gemini 3 Pro Image Preview (Nano Banana Pro) for stunning 1K visuals.
- **Live Wallpapers**: Generates seamless video loops using Google Veo.
- **Live Preview**: Real-time virtualization of the theme on a 3D-styled Android interface.
- **Responsive Design**: Optimized for desktop and mobile usage.
- **Theme Export**: Download your configuration as a JSON file.

## Tech Stack

- **Frontend**: React 19, Tailwind CSS, Framer Motion
- **AI**: Google GenAI SDK (`@google/genai`)
- **Icons**: Lucide React
- **Build Tool**: Vite

## Getting Started

1.  **Clone the repository**.
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Environment Setup**:
    - Create a file named `.env` in the root directory of the project.
    - Add your Gemini API key to this file:
      ```env
      API_KEY=your_actual_api_key_here
      ```
    - *Note: Ensure this file is not committed to GitHub (it is listed in .gitignore).*

4.  **Run the development server**:
    ```bash
    npm run dev
    ```

5.  **Build for Production**:
    ```bash
    npm run build
    ```

## Mobile Usage & Local Testing

The app is fully responsive and designed for mobile interaction. 

**To test on your Android phone while developing:**
1.  Ensure your computer and Android phone are connected to the **same Wi-Fi network**.
2.  Run the dev server with the host flag:
    ```bash
    npm run dev -- --host
    ```
3.  On your Android phone, open Chrome and navigate to your computer's local IP address shown in the terminal (e.g., `http://192.168.1.5:5173`).
4.  Use the **hamburger menu** in the top-left corner to access controls.

## API Key & Billing

This application uses the Google GenAI SDK. 
- For basic features, a standard API key works.
- For **Veo** (Live Wallpapers) and **Gemini 3 Pro** (High Quality Images), a paid API key via a billing-enabled Google Cloud Project is required. The app includes a built-in selector flow for this if your provided key does not support it.
