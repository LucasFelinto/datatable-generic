import { LightningElement, api } from 'lwc';
import { deleteRecord, updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from "lightning/navigation";

export default class GenericDataTable extends NavigationMixin(LightningElement) {
  @api columns = [];
  @api content = [];
  @api cardTitle = '';
  @api cardIconName = '';
  @api objectName = '';

  selectedRows = [];

  get isDisabledDeleteButton() {
    return this.selectedRows.length === 0;
  }

  async deleteRecords(recordId) {
    try {
      for await (let id of recordId) {
        deleteRecord(id);
      }
      this.showNotification('Success', 'Deleted Records', 'success');
    } catch (error) {
      this.showNotification('Error', error.message, 'error');
    }
  }

  updateRecords(records) {
    for (let record of records) {
      updateRecord(record).then(() => {
        this.showNotification('Success', 'Updated Records', 'success');
      }).catch((error) => {
        this.showNotification('Error', error.body?.message, 'error');
      })
    }
  }

  handleDeleteRow() {
    const recordId = new Set();
    this.selectedRows.forEach(row => recordId.add(row.Id));
    this.deleteRecords(recordId);
  }

  handleRowSelection(event) {
    this.selectedRows = event.detail.selectedRows;
  }

  handleSave(event) {
    const draftValues = event.detail.draftValues.map(value => {
      return {
        fields: value
      }
    });
    this.updateRecords(draftValues);
  }

  handleRowAction(event) {
    const actionName = event.detail.action.name;
    const row = event.detail.row;

    if (actionName === 'edit') {
      const config = {
        type: "standard__recordPage",
        attributes: {
          recordId: row.Id,
          objectApiName: this.objectName,
          actionName: "edit"
        }
      };
      this[NavigationMixin.Navigate](config);
    } else if (actionName === 'delete') {
      this.deleteRecords([row.Id]);
    }
  }

  handleCreateRecord() {
    this[NavigationMixin.Navigate]({
      type: 'standard__objectPage',
      attributes: {
        objectApiName: this.objectName,
        actionName: 'new'
      }
    });
  }

  showNotification(title, message, variant) {
    const toast = new ShowToastEvent({
      title,
      message,
      variant
    });
    this.dispatchEvent(toast);
  }
}