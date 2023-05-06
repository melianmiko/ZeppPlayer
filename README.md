![Logo](docs/logo.png) ZeppPlayer
----------------------------------

This application can run ZeppOS apps & watchfaces in your 
browser. Useful for homebrew development, faster and more 
flexible than the official ZeppOS Simulator, but a bit 
less compatible.

- [💿 Binary download](https://melianmiko.ru/en/zepp_player/)

## Build from source code
Requirements: python3 with pip and venv, esbuild, nodejs and npm.

1. `npm ci` and `npm run build`
2. Create python virtualenv and activate them
3. Install dependencies via `pip install -r requirements.txt`
4. Run `python make_release.py`

## Contributors
- MelianMiko: Main developer
- [Игорь Худяков](https://4pda.to/forum/index.php?showuser=5434953): Better SmartBnad7 overlay mask
