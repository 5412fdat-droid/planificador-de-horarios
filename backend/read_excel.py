import openpyxl

def main():
    file_path = r"c:\Users\Nuevo Usuario\Documents\proyecto de sistemas de informacion II\proyecto\HORARIOS  ING. EN SISTEMAS  I-2026.xlsx"
    wb = openpyxl.load_workbook(file_path, data_only=True)
    sheet = wb.active
    
    print(f"Sheet: {sheet.title}")
    
    for row in range(1, 100):
        row_data = []
        has_data = False
        for col in range(1, 12):
            val = sheet.cell(row=row, column=col).value
            if val:
                has_data = True
            row_data.append(str(val))
        if has_data:
            print(f"Row {row}: {' | '.join(row_data)}")

if __name__ == '__main__':
    main()
