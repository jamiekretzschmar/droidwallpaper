import sys
import os
import signal
import json
import time
from typing import Dict, Any

# --- 1. Dependency Check ---
try:
    from rich.console import Console
    from rich.panel import Panel
    from rich.layout import Layout
    from rich.text import Text
    from rich.align import Align
    from rich.style import Style
    from rich.table import Table
    from rich.prompt import Prompt
except ImportError:
    print("CRITICAL ERROR: 'rich' library not found.")
    print("Please run: pip install -r requirements.txt")
    sys.exit(1)

# Initialize Console
console = Console()

# --- 2. Signal Handling ---
def signal_handler(sig, frame):
    """Handles CTRL+C gracefully."""
    console.print("\n[bold red]Process Interrupted by User (SIGINT).[/bold red]")
    console.print("[yellow]Exiting DroidThemeAI gracefully...[/yellow]")
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)

# --- 3. Configuration & Constants ---
CONFIG_FILE = "theme_config.json"
OUTPUT_DIR = "output"

DEFAULT_CONFIG = {
    "meta": {"name": "Default Theme", "version": "1.0.0"},
    "palette": {
        "primary": "#FFFFFF", "secondary": "#CCCCCC", 
        "accent": "#0000FF", "background": "#000000", 
        "surface": "#333333", "text_primary": "#FFFFFF"
    },
    "layout": {"status_bar_visible": True, "dock_enabled": True}
}

# --- 4. Logic Classes ---

class ConfigValidator:
    """Ensures JSON integrity and applies fallback values."""
    
    @staticmethod
    def validate(data: Dict[str, Any]) -> Dict[str, Any]:
        console.print("[dim]Validating configuration schema...[/dim]")
        
        # Ensure top-level keys exist
        for key in DEFAULT_CONFIG:
            if key not in data:
                console.print(f"[yellow]Warning: Missing top-level key '{key}'. Injecting default.[/yellow]")
                data[key] = DEFAULT_CONFIG[key]
        
        # Ensure palette keys exist
        if "palette" in data:
            for color_key in DEFAULT_CONFIG["palette"]:
                if color_key not in data["palette"]:
                    console.print(f"[yellow]Warning: Missing color '{color_key}'. Using default.[/yellow]")
                    data["palette"][color_key] = DEFAULT_CONFIG["palette"][color_key]
        
        return data

class ThemeEngine:
    def __init__(self):
        self.config = {}

    def check_environment(self):
        """Checks for Termux environment and storage permissions."""
        is_termux = "com.termux" in os.environ.get("PREFIX", "")
        if is_termux:
            console.print("[cyan]Environment: Android (Termux) detected.[/cyan]")
            # Check for storage access (simple check if we can write to local dir)
            if not os.access(".", os.W_OK):
                console.print("[bold red]ERROR: No write permission in current directory.[/bold red]")
                console.print("Please check your permissions.")
                sys.exit(1)
        else:
            console.print("[dim]Environment: Standard Linux/Unix/Windows[/dim]")

    def load_config(self):
        """Loads and validates the JSON config."""
        try:
            if not os.path.exists(CONFIG_FILE):
                raise FileNotFoundError(f"{CONFIG_FILE} not found.")

            with open(CONFIG_FILE, 'r') as f:
                raw_data = json.load(f)
            
            self.config = ConfigValidator.validate(raw_data)
            console.print(f"[green]Successfully loaded theme: {self.config.get('meta', {}).get('name')}[/green]")

        except FileNotFoundError:
            console.print(f"[bold red]Error:[/bold red] {CONFIG_FILE} not found.")
            console.print(f"[yellow]Creating default {CONFIG_FILE}...[/yellow]")
            self.create_default_config()
            self.config = DEFAULT_CONFIG
        except json.JSONDecodeError as e:
            console.print(f"[bold red]JSON Syntax Error:[/bold red] {e}")
            console.print("[yellow]Please fix the syntax in theme_config.json[/yellow]")
            sys.exit(1)
        except Exception as e:
            console.print(f"[bold red]Unexpected Error:[/bold red] {e}")
            sys.exit(1)

    def create_default_config(self):
        try:
            with open(CONFIG_FILE, 'w') as f:
                json.dump(DEFAULT_CONFIG, f, indent=2)
        except PermissionError:
            console.print("[bold red]Permission Denied:[/bold red] Cannot write to current directory.")
            sys.exit(1)

    def render_preview(self):
        """Renders a TUI preview of the phone screen."""
        console.print("\n[bold]Generative Preview:[/bold]")
        
        palette = self.config.get("palette", {})
        bg_color = palette.get("background", "#000000")
        primary_color = palette.get("primary", "#ffffff")
        accent_color = palette.get("accent", "#0000ff")
        surface_color = palette.get("surface", "#333333")
        text_color = palette.get("text_primary", "#ffffff")

        # Create the UI components
        
        # Status Bar
        status_bar = Align.center(
            Text("12:00  ⚡ 5G  100%", style=f"{text_color} on {bg_color}"), 
            vertical="top"
        )
        
        # Clock Widget
        clock_widget = Panel(
            Align.center(Text("12:00", style=f"bold {primary_color}")),
            style=f"on {bg_color}",
            border_style=primary_color,
            box=None
        )

        # Icons Grid
        grid_table = Table.grid(expand=True, padding=1)
        grid_table.add_column(justify="center")
        grid_table.add_column(justify="center")
        grid_table.add_column(justify="center")
        grid_table.add_column(justify="center")

        for _ in range(4): # 4 rows
            row_icons = []
            for _ in range(4): # 4 cols
                icon = Text(" ■ ", style=f"{accent_color} on {surface_color}")
                row_icons.append(icon)
            grid_table.add_row(*row_icons)

        # Dock
        dock = Panel(
            Align.center(Text(" 📞  💬  🌐  📷 ", style=f"{primary_color}")),
            style=f"on {surface_color}",
            border_style=surface_color
        )

        # Assembly
        screen_content = Layout(name="screen")
        screen_content.split_column(
            Layout(status_bar, name="status", size=1),
            Layout(clock_widget, name="clock", size=3),
            Layout(Align.center(grid_table), name="grid"),
            Layout(dock, name="dock", size=3)
        )

        # Phone Frame
        phone_frame = Panel(
            screen_content,
            title=f"[bold]{self.config.get('meta', {}).get('name')}[/bold]",
            subtitle=f"{self.config.get('meta', {}).get('target_device', 'Android')}",
            width=40,
            height=25,
            style=f"on {bg_color}",
            border_style="white"
        )

        console.print(Align.center(phone_frame))

    def export_artifact(self):
        """Exports the processed theme to the output directory."""
        if not os.path.exists(OUTPUT_DIR):
            try:
                os.makedirs(OUTPUT_DIR)
            except OSError as e:
                console.print(f"[red]Failed to create output directory: {e}[/red]")
                return

        output_path = os.path.join(OUTPUT_DIR, "final_render.json")
        
        try:
            with open(output_path, 'w') as f:
                # Add timestamp and processing metadata
                export_data = self.config.copy()
                export_data["_generated_at"] = time.strftime("%Y-%m-%d %H:%M:%S")
                export_data["_engine"] = "DroidThemeAI v1.0"
                
                json.dump(export_data, f, indent=2)
            
            console.print(f"\n[bold green]SUCCESS:[/bold green] Theme pack exported to [underline]{output_path}[/underline]")
        except PermissionError:
             console.print(f"[bold red]Permission Denied:[/bold red] Cannot write to {output_path}")

# --- 5. Main Execution Flow ---
def main():
    console.print(Panel.fit("[bold cyan]DroidTheme AI[/bold cyan] - Termux Edition", border_style="cyan"))
    
    engine = ThemeEngine()
    engine.check_environment()
    engine.load_config()
    
    # Simulate processing
    with console.status("[bold green]Synthesizing Theme assets...[/bold green]", spinner="dots"):
        time.sleep(1.5) # Fake work
        
    engine.render_preview()
    engine.export_artifact()

if __name__ == "__main__":
    main()