import React from 'react';
import Modal from 'react-bootstrap/Modal';
import CreateLabelValueForm from './forms/createLabelValuelForm';
import EditLabelValueForm from './forms/editLabelValueForm';
import DeleteLabelValueForm from './forms/deleteLabelValueFrom';

const FormModal = props => {
  const { show, onExited, onHide, title, formType, labelId, labelValueId } = props;
  return (
    <Modal
      show={show}
      onExited={onExited}
      onHide={onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {formType === 'NEW_LABEL_VALUE' ? <CreateLabelValueForm labelId={labelId} /> : null}
        {formType === 'EDIT_LABEL_VALUE' ? (
          <EditLabelValueForm labelId={labelId} labelValueId={labelValueId} />
        ) : null}
        {formType === 'DELETE_LABEL_VALUE' ? (
          <DeleteLabelValueForm labelId={labelId} labelValueId={labelValueId} />
        ) : null}
      </Modal.Body>
    </Modal>
  );
};

export default FormModal;
