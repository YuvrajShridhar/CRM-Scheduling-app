Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Get the directory where this script is located
scriptPath = objFSO.GetParentFolderName(WScript.ScriptFullName)
htmlFile = "app.html"

' Check if Python is available
On Error Resume Next
Set objExec = objShell.Exec("python --version")
pythonAvailable = (Err.Number = 0)
On Error Goto 0

' If Python is available, start a background server
If pythonAvailable Then
    ' Start server silently in background
    objShell.Run "powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -Command """ & scriptPath & "\server.ps1""", 0, False
    
    ' Wait a moment for server to start
    WScript.Sleep 2000
End If

' Open the HTML file in default browser
htmlPath = scriptPath & "\" & htmlFile
If objFSO.FileExists(htmlPath) Then
    objShell.Run htmlPath, 1, False
Else
    MsgBox "Error: Could not find " & htmlFile & " in " & scriptPath, vbCritical, "CRM System"
End If
