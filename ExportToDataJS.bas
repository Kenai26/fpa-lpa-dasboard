' ============================================================
' DC 6084 — Export Roster & FPA/LPA to data.js
' ============================================================
' HOW TO USE:
'   1. Open your Excel workbook with two sheets:
'        Sheet "Roster"   → User ID | Name | Area | Shift | Role | Hire Date
'        Sheet "FPA_LPA"  → User ID | Date | FPA Minutes | LPA Minutes
'   2. Press Alt+F11 to open the VBA editor
'   3. Insert > Module, paste this code
'   4. Close VBA editor, press Alt+F8, run "ExportToDataJS"
'   5. It saves data.js to the same folder as the workbook
'   6. Copy that data.js into your fpa-lpa-dashboard folder
' ============================================================

Sub ExportToDataJS()
    Dim fPath As String
    Dim fNum As Integer
    Dim ws As Worksheet
    Dim lastRow As Long
    Dim i As Long
    
    ' Output path = same folder as workbook
    fPath = ThisWorkbook.Path & "\data.js"
    fNum = FreeFile
    Open fPath For Output As #fNum
    
    ' --- Header ---
    Print #fNum, "/* Auto-generated from Excel on " & Format(Now, "yyyy-mm-dd hh:nn") & " */"
    Print #fNum, ""
    Print #fNum, "const GOALS = Object.freeze({ FPA_MINUTES: 16, LPA_MINUTES: 14 });"
    Print #fNum, ""
    Print #fNum, "const AREAS = ["
    Print #fNum, "  'Dry 1st', 'Dry 2nd', 'Dry 4th', 'Dry 5th',"
    Print #fNum, "  'FDD 1st', 'FDD 2nd', 'FDD 4th', 'FDD 5th',"
    Print #fNum, "  'MP 1st',  'MP 2nd',  'MP 4th',  'MP 5th',"
    Print #fNum, "];"
    Print #fNum, ""
    Print #fNum, "const SHIFTS = ['1st', '2nd', '4th', '5th'];"
    Print #fNum, "const ROLES  = ['Orderfiller', 'Lift Driver'];"
    Print #fNum, ""
    
    ' --- Roster ---
    Print #fNum, "const ASSOCIATE_ROSTER = ["
    Set ws = ThisWorkbook.Sheets("Roster")
    lastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    For i = 2 To lastRow
        Dim uid As String, nm As String, ar As String
        Dim sh As String, rl As String, hd As String
        uid = Trim(ws.Cells(i, 1).Value)
        nm = Trim(ws.Cells(i, 2).Value)
        ar = Trim(ws.Cells(i, 3).Value)
        sh = Trim(ws.Cells(i, 4).Value)
        rl = Trim(ws.Cells(i, 5).Value)
        hd = Format(ws.Cells(i, 6).Value, "yyyy-mm-dd")
        If uid <> "" Then
            Print #fNum, "  { userId: '" & uid & "', name: '" & nm & "', area: '" & ar & "', shift: '" & sh & "', role: '" & rl & "', hireDate: '" & hd & "' },"
        End If
    Next i
    Print #fNum, "];"
    Print #fNum, ""
    
    ' --- FPA/LPA ---
    Print #fNum, "const FPA_LPA_DATA = ["
    Set ws = ThisWorkbook.Sheets("FPA_LPA")
    lastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    For i = 2 To lastRow
        Dim fUid As String, fDate As String
        Dim fpa As String, lpa As String
        fUid = Trim(ws.Cells(i, 1).Value)
        fDate = Format(ws.Cells(i, 2).Value, "yyyy-mm-dd")
        fpa = Trim(ws.Cells(i, 3).Value)
        lpa = Trim(ws.Cells(i, 4).Value)
        If fUid <> "" Then
            Print #fNum, "  { userId: '" & fUid & "', date: '" & fDate & "', fpaMinutes: " & fpa & ", lpaMinutes: " & lpa & " },"
        End If
    Next i
    Print #fNum, "];"
    
    Close #fNum
    MsgBox "Exported to:" & vbCrLf & fPath, vbInformation, "Export Complete"
End Sub
