const { rgb } = require("pdf-lib");
const { PAGE_WIDTH, PAGE_HEIGHT, MARGIN } = require("./styles");

class PDFBuilder {
  constructor(pdfDoc, page, font) {
    this.pdfDoc = pdfDoc;
    this.page = page;
    this.pages = [page];
    this.font = font;
    this.x = MARGIN;
    this.y = PAGE_HEIGHT - MARGIN;
    this.lineHeight = 14;
  }

  addLn(height = this.lineHeight) {
    this.y -= height;
  }
  newPage() {
    const page = this.pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    this.pages.push(page);
    this.page = page;
    this.x = MARGIN;
    this.y = PAGE_HEIGHT - MARGIN;
  }

  checkPageSpace(height) {
    if (this.y - height < MARGIN) {
      this.newPage();
    }
  }

  addBox({ width = 100, height = 30, color = rgb(0.8, 0.8, 0.8), text = "" }) {
    this.page.drawRectangle({
      x: this.x,
      y: this.y - height,
      width,
      height,
      color,
      borderColor: rgb(0.8, 0.8, 0.8),
      borderWidth: 1,
    });

    if (text) {
      this.page.drawText(text, {
        x: this.x + 5,
        y: this.y - height / 2 + 5,
        size: 12,
        font: this.font,
      });
    }

    this.y -= height + 5; 
  }
  addText(text, options = {}) {
    const { size = 12, bold = false, align = "left" } = options;
    const fontWeight = bold ? size + 2 : size;
    let x = this.x;

    const textWidth = this.font.widthOfTextAtSize(text, fontWeight);

    if (align === "center") x = (PAGE_WIDTH - textWidth) / 2;
    if (align === "right") x = PAGE_WIDTH - textWidth - MARGIN;

    this.page.drawText(text, {
      x,
      y: this.y,
      size: fontWeight,
      font: this.font,
    });
    this.y -= fontWeight + 5;
  }

  async addImage(imagePath, width = 100, height = 100) {
    const imageBytes = require("fs").readFileSync(imagePath);
    const image = await this.pdfDoc.embedJpg(imageBytes);

    this.page.drawImage(image, {
      x: this.x,
      y: this.y - height,
      width,
      height,
    });

    this.y -= height + 10;
  }

  addTable(data, options = {}) {
    const {
      columnWidths = [],
      rowHeight = 20,
      headerColor = rgb(0.8, 0.8, 0.8),
      headerHeight = 20,
    } = options;
    let startX = this.x;
    let startY = this.y;

    if (this.y - headerHeight < 50) this.newPage();

    data.headers.forEach((header, i) => {
      const width = columnWidths[i] || 100;
      this.page.drawRectangle({
        x: startX,
        y: startY - rowHeight,
        width,
        height: rowHeight,
        color: headerColor,
      });

      this.page.drawText(header, {
        x: startX + 5,
        y: startY - 15,
        size: 12,
        font: this.font,
      });
      startX += width;
    });

    startY -= rowHeight;

    data.rows.forEach((row, rowIndex) => {
      startX = this.x;
      startY -= rowHeight;

      if (startY - rowHeight < 50) {
        this.newPage();
        startY = this.y;

        let headerX = this.x;
        data.headers.forEach((header, i) => {
          const width = columnWidths[i] || 100;
          this.page.drawRectangle({
            x: headerX,
            y: startY - rowHeight,
            width,
            height: rowHeight,
            color: headerColor,
          });

          this.page.drawText(header, {
            x: headerX + 5,
            y: startY - 15,
            size: 12,
            font: this.font,
          });
          headerX += width;
        });

        startY -= rowHeight;
      }

      row.forEach((cell, i) => {
        const width = columnWidths[i] || 100;
        this.page.drawRectangle({
          x: startX,
          y: startY - rowHeight,
          width,
          height: rowHeight,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });

        this.page.drawText(cell.toString(), {
          x: startX + 5,
          y: startY - 15,
          size: 12,
          font: this.font,
        });
        startX += width;
      });
    });

    this.y = startY - 10;
  }

  addContainer(content, options = {}) {
    const {
      width = PAGE_WIDTH - 2 * MARGIN,
      padding = 10,
      bgColor = null,
      borderColor = rgb(0, 0, 0),
      borderWidth = 1,
    } = options;

    let startX = this.x;
    let startY = this.y;

    if (bgColor) {
      this.page.drawRectangle({
        x: startX,
        y: startY - padding,
        width,
        height: -this.y + startY + padding,
        color: bgColor,
      });
    }

    this.page.drawRectangle({
      x: startX,
      y: startY - padding,
      width,
      height: -this.y + startY + padding,
      borderColor,
      borderWidth,
    });

    let itemX = startX + padding;
    let itemY = startY - padding;

    content.forEach((item) => {
      if (typeof item === "string") {
        this.addText(item, { align: "left" });
      } else if (typeof item === "object" && item.type === "image") {
        this.addImage(item.src, item.width, item.height);
      } else if (typeof item === "object" && item.type === "table") {
        this.addTable(item.data, item.options);
      }
    });

    this.y -= 20;
  }
  addNewForm() {
    return new PDFForm(this);
  }
}

class PDFForm {
  constructor(pdfBuilder) {
    this.pdfBuilder = pdfBuilder;
    this.form = this.pdfBuilder.pdfDoc.getOrCreateForm();
  }

  addTextInput(label, fieldName, width = 200, height = 20) {
    const { pdfBuilder } = this;

    pdfBuilder.checkPageSpace(height + 10);

    pdfBuilder.page.drawText(label, {
      x: pdfBuilder.x,
      y: pdfBuilder.y,
      size: 12,
      font: pdfBuilder.font,
    });

    const textField = this.form.createTextField(fieldName);
    textField.setText("");
    textField.addToPage(pdfBuilder.page, {
      x: pdfBuilder.x + 100,
      y: pdfBuilder.y - height,
      width,
      height,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    pdfBuilder.y -= height + 10;
  }
}

module.exports = { PDFBuilder };
