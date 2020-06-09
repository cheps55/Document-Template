import React, { Component } from 'react';
import ReactHtmlParser from 'react-html-parser';
import mammoth from "mammoth";
import css from "../css/pdf.css"
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      template: null,
      format: '',
      formatArray: [],
      file: null,
      data: {},
      PDFButton: false,
      test: 'test'
    };
    
  }
  
  fileChange(evt) {
    this.setState({
      file: evt.target.files
    })
  }

  templateChange(evt) {
    this.setState({
      template: evt.target.files
    })
  }

  // get template format
  getTemplateFormat() {
    let files = this.state.template;
    if(files == null) {
      alert('No Template selected');
      return;
    } else if((files[0].name).split('.')[1] !== 'docx') {
      alert('Not Docx file selected');
      return;
    }
    var f = files[0];
    // get format inside template
    var reader = new FileReader();
    reader.onload = ((file) => {
      var arrayBuffer = reader.result;
      // convert docx to html
      mammoth.convertToHtml({arrayBuffer: arrayBuffer}).then((resultObject) => {
        // store the template format in html format
        this.setState({ format: resultObject.value }, () => {
          this.submitFile();
        });
      });
    });
    reader.readAsArrayBuffer(f);
  }

  // get JSON data
  submitFile() {
    // get Json file
    let files = this.state.file;
    // read JSON file only
    if(files == null) {
      alert('No JSON selected');
      return;
    } else if((files[0].name).split('.')[1] !== 'json') {
      alert('Not JSON file selected');
      return;
    }
    var f = files[0];
    // read data inside JSON
    var reader = new FileReader();
    reader.onload = ((file) => {
      return (e) => {
				try {
          // get data from json
          var json = JSON.parse(e.target.result);
					// store the template format in html format
          this.setState({ data: json }, () => {
            this.PDFformatting();
          });
				} catch (ex) { alert("Exception: ", ex); }
      }
    })(f);
    reader.readAsText(f);
  }

  // format for the new PDF
  PDFformatting() {
    var newFormat = this.state.format;
    const formatArray = [];
    
    // split the string for adding variable
    formatArray.push(newFormat.split('{{doc.firstname}} {{doc.lastname}}')[0]);
    newFormat = newFormat.split('{{doc.firstname}} {{doc.lastname}}')[1];
    formatArray.push(newFormat.split('{{doc.email}}')[0]);
    newFormat = newFormat.split('{{doc.email}}')[1];
    formatArray.push(newFormat.split('{{doc.phone}}')[0]);
    newFormat = newFormat.split('{{doc.phone}}')[1];
    formatArray.push(newFormat.split('{{doc.photo}}')[0]);
    newFormat = newFormat.split('{{doc.photo}}')[1];
    formatArray.push(newFormat);
    
    this.setState({
      formatArray: formatArray
    });
  }

  // allow download PDF
  downloadPDF() {
    const input = document.getElementById('pdf');

    html2canvas(input, {
      scale: 5
    })
    .then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      pdf.addImage(imgData, 'PNG', pdf.internal.pageSize.getWidth() / 8, 30, canvas.width / 15, canvas.height / 15);
      pdf.save("Document.pdf");
    });
  }

  // generate PDF with template and JSON
  generate() {
    this.getTemplateFormat();
  }

  render() {
    return (
      <div>
        <div className="main">
          <table><tbody>
            <tr>
              <td>Template:</td>
              <td><input type='file' name='template' onChange={this.templateChange.bind(this)} /></td>
            </tr>
            <tr>
              <td>JSON:</td>
              <td><input type='file' name='file' onChange={this.fileChange.bind(this)} /></td>
            </tr>
          </tbody></table>
          <button onClick={this.generate.bind(this)}>Generate</button>
          {
            this.state.data.doc != null &&
            <button onClick={this.downloadPDF.bind(this)}>Download</button>
          }
        </div>
        <div className="pdf" id="pdf">
            {
              this.state.data.doc != null &&
              ReactHtmlParser(this.state.formatArray[0] + this.state.data.doc.firstname + " " + this.state.data.doc.lastname + 
                this.state.formatArray[1] + this.state.data.doc.email +
                this.state.formatArray[2] + this.state.data.doc.phone +
                this.state.formatArray[3] + '<img src="' + this.state.data.doc.photo +'">' + 
                this.state.formatArray[4]
              )
            }
        </div>
      </div>
    );
  }
}

export default App;
