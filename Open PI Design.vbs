Option Explicit
Dim shell, files, projectFolder, command
Set shell = CreateObject("WScript.Shell")
Set files = CreateObject("Scripting.FileSystemObject")
projectFolder = files.GetParentFolderName(WScript.ScriptFullName)
command = "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File " & Chr(34) & files.BuildPath(projectFolder, "Start-Website.ps1") & Chr(34)
shell.Run command, 0, False

