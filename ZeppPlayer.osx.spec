# -*- mode: python ; coding: utf-8 -*-


block_cipher = None


a = Analysis(
    ['zp_server/__main__.py'],
    pathex=[],
    binaries=[],
    datas=[('package.json', '.'), ('venv/lib/python3.11/site-packages/sv_ttk', 'sv_ttk'), ('app', 'app'), ('projects/demo', 'projects/demo')],
    hiddenimports=[],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)
pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='ZeppPlayer',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=['app/icon.png'],
)
coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='ZeppPlayer',
)
app = BUNDLE(
    coll,
    name='ZeppPlayer.app',
    icon='app/icon.png',
    bundle_identifier=None,
)
