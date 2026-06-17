from pathlib import Path


def test_windows_native_install_path_docs_match_installer() -> None:
    doc = Path("website/docs/user-guide/windows-native.md").read_text()
    install = Path("scripts/install.ps1").read_text()

    assert "%LOCALAPPDATA%\\nozich\\nozich-agent\\venv\\Scripts" in doc
    assert "Get-Command nozich        # should print C:\\Users\\<you>\\AppData\\Local\\nozich\\nozich-agent\\venv\\Scripts\\nozich.exe" in doc
    assert '$nozichBin = "$InstallDir\\venv\\Scripts"' in install
