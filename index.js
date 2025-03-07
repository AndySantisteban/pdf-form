const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs');
const { PDFBuilder } = require('./pdf');

async function generatePDF() {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    const pdf = new PDFBuilder(pdfDoc, page, font);

    pdf.addText('Reporte de Ventas', { size: 20, bold: true });
    pdf.addLn(10); 
    pdf.addText('Fecha: 25 de Febrero de 2025', { size: 12 });
    pdf.addLn(10);
    pdf.addBox({ width: 200, height: 50, color: rgb(0.9, 0.9, 0.9), text: 'Caja de Resumen' });
    pdf.addLn(20);
    pdf.addText('Detalle de la compra:', { size: 16, underline: true });
    pdf.addLn(10);
    pdf.addTable(
        {
            headers: ['Producto', 'Cantidad', 'Precio'],
            rows: [
                ['Laptop', '2', '$1500'],
                ['Mouse', '5', '$20'],
                ['Teclado', '3', '$50'],
            ],
        },
        { columnWidths: [200, 100, 100] }
    );
    pdf.addLn(40);
    pdfDoc.getForm().updateFieldAppearances();

    const form = pdf.addNewForm();
    form.addTextInput('Nombre:','Nombre', 360);
    form.addTextInput('Correo:','Correo', 200);
    form.addTextInput('Dirección:','Dirección', 200);
    form.addTextInput('Ciudad:','Ciudad', 200);
    pdf.addTable(
        {
            headers: ['Producto', 'Cantidad', 'Precio'],
            rows: [
                ['Laptop', '2', '$1500'],
                ['Mouse', '5', '$20'],
                ['Teclado', '3', '$50'],
                ['Mouse', '5', '$20'],
                ['Teclado', '3', '$50'],
                ['Laptop', '2', '$1500'],
                ['Mouse', '5', '$20'],
                ['Teclado', '3', '$50'],
                ['Mouse', '5', '$20'],
                ['Teclado', '3', '$50'],
                ['Laptop', '2', '$1500'],
                ['Mouse', '5', '$20'],
                ['Teclado', '3', '$50'],
                ['Mouse', '5', '$20'],
                ['Teclado', '3', '$50'],
                ['Laptop', '2', '$1500'],
                ['Mouse', '5', '$20'],
                ['Teclado', '3', '$50'],
                ['Mouse', '5', '$20'],
                ['Teclado', '3', '$50'],
            ],
        },
        { columnWidths: [200, 100, 200] }
    );

    pdf.addLn(40);
    const form2 = pdf.addNewForm();
    form2.addTextInput('Nombre 2:','Nombre2', 200);
    form2.addTextInput('Correo 2:','Correo2', 200);
    form2.addTextInput('Dirección 2:','Dirección2', 200);
    form2.addTextInput('Ciudad 2:','Ciudad2', 200);
    
    pdf.addLn(10)
    pdf.addText('Fecha: 23 de Febrero de 2025', { size: 12 }); 
    pdf.addText('Fecha: 235 de Febrero de 2025', { size: 12 }); 
    pdf.addText('Fecha: 235 de Febrero de 2025', { size: 12 });





    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync('output.pdf', pdfBytes);
    console.log('✅ PDF generado correctamente: output.pdf');
}

generatePDF();
