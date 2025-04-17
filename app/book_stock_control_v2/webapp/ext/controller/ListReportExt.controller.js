sap.ui.define([
    "sap/ui/core/mvc/ControllerExtension",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
  ], function (ControllerExtension, Fragment, MessageToast, JSONModel) {
    "use strict";
  
    return ControllerExtension.extend("bookstockcontrolv2.ext.controller.ListReportExt", {
  
      /**
       * Opens the dialog to select a CSV file.
       */
      onUploadCSV: function () {
        const oView = this.base.getView();
        Fragment.load({
          id: oView.getId(),
          name: "bookstockcontrolv2.ext.view.UploadFileDialog",
          controller: this
        }).then(oDialog => {
          this.pDialog = oDialog;
          oView.addDependent(this.pDialog);
          this.pDialog.open();
        });
      },
  
      /**
       * Closes and destroys the CSV upload dialog.
       */
      onCloseDialog: function () {
        if (this.pDialog) {
          this.pDialog.close();
          this.pDialog.destroy(true);
          this.pDialog = null;
        }
        this.oFileData = undefined;
      },
  
      /**
       * Handles the CSV file selection and parses its content into this.oFileData.
       * @param {sap.ui.base.Event} oEvent The file uploader change event.
       */
      handleFiles: function (oEvent) {
        const oView = this.base.getView();
        const oModelContentCsv = new JSONModel();
        const oFile = oEvent.getParameter("files")[0];
        const reader = new FileReader();
  
        reader.onload = function (e) {
          const lines = e.target.result
            .split(/\r\n|\n/)
            .map(line => line.split(";"))
            .filter(arr => arr.length > 1);
  
          // The first row contains headers
          const headers = lines.shift();
          const aData = lines.map(cols => {
            const obj = {};
            headers.forEach((h, i) => obj[h] = cols[i]);
            return obj;
          });
  
          oModelContentCsv.setData(aData);
          this.oFileData = aData;
          // show the message strip
          const oStrip = this.base.byId("messageStripId");
          oStrip && oStrip.setVisible(true);
        }.bind(this);
  
        reader.onerror = function (evt) {
          if (evt.target.error.name === "NotReadableError") {
            const msg = oView.getModel("i18n")
              .getResourceBundle()
              .getText("msgErrorRead");
            MessageToast.show(msg);
          }
        }.bind(this);
  
        reader.readAsText(oFile);
      },
  
      /**
       * Calls the UploadBooks action on the backend with the parsed CSV data.
       */
      onUploadData: function () {
        const oView = this.base.getView();
        const oModel = oView.getModel();
  
        // Prepare array of items from parsed CSV data
        const aItems = (this.oFileData || []).map(item => ({
          title: item.title,
          stock: parseInt(item.stock, 10)
        }));
  
        if (!aItems.length) {
          const sMsg = oView.getModel("i18n")
            .getResourceBundle()
            .getText("msgNonFileSelect");
          return MessageToast.show(sMsg);
        }
  
        // Send POST request to /UploadBooks
        fetch(`${oModel.sServiceUrl}UploadBooks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: aItems })
        })
        .then(res => {
          if (!res.ok) throw new Error(`Error ${res.status}`);
          return res.json();
        })
        .then(nCreated => {
          MessageToast.show(`Created ${nCreated} books.`);
          this.onCloseDialog();
          // Refresh the list
          setTimeout(() => {
            const oBtn = this.base.byId(
              "bookstockcontrolv2::BooksList--fe::FilterBar::Books-btnSearch"
            );
            oBtn && oBtn.firePress();
          }, 500);
        })
        .catch(err => {
          MessageToast.show(err.message);
        });
      },
  
      /**
       * Generates and downloads a CSV template file.
       */
      onDownloadTemplate: function () {
        const csv = "title;stock";
        const a = document.createElement("a");
        a.href = "data:text/csv;charset=utf-8," + encodeURI(csv);
        a.download = "TemplateCsv.csv";
        a.click();
      }
  
    });
  });
  