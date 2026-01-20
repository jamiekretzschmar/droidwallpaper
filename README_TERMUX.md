# DroidThemeAI (Termux Edition)

This is the Python-based CLI version of DroidThemeAI, optimized for the Google Pixel 9 and Android 14 environments running Termux.

## Prerequisites

1.  **Update Termux:**
    ```bash
    pkg update && pkg upgrade
    ```

2.  **Install Python & Git:**
    ```bash
    pkg install python git
    ```

3.  **Setup Storage (Critical for Android 14):**
    ```bash
    termux-setup-storage
    ```
    *Grant the permission when asked.*

## Installation

1.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

## Configuration

Edit the `theme_config.json` file to customize your theme.
```bash
nano theme_config.json
```
You can change colors (Hex codes), layout settings, and meta information.

## Usage

Run the generator:
```bash
python main.py
```

## Troubleshooting

### "Permission Denied"
*   Ensure you have run `termux-setup-storage`.
*   Ensure you are writing to the local folder or `~/storage/downloads`, not the root system `/`.

### JSON Errors
*   If the app crashes with a JSON error, verify your `theme_config.json` syntax. Ensure all commas and quotes are closed correctly.
*   The app will attempt to use default values if keys are missing, but syntax errors must be fixed manually.

### "Rich" not found
*   Run `pip install rich` manually if the requirements file fails.
