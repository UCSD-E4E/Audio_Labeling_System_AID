import axios from 'axios';

export const handleAllSegmentSave = annotate => {
  const { segmentationUrl, wavesurfer, wavesurferMethods } = annotate.state;
  Object.values(wavesurfer.regions.list).forEach(segment => {
    if (!segment.saved && segment.data.annotations !== '' && segment.data.annotations != null) {
      try {
        const { start, end } = segment;
        const { annotations = '', segmentation_id = null } = segment.data;
        annotate.setState({ isSegmentSaving: true });
        const now = Date.now();
        let time_spent = 0;
        if (segment.lastTime === 0) {
          time_spent = now - annotate.lastTime;
        } else {
          time_spent = now - segment.lastTime;
        }
        segment.setLastTime(now);
        if (segmentation_id === null) {
          axios({
            method: 'post',
            url: segmentationUrl,
            data: {
              start,
              end,
              annotations,
              time_spent
            }
          })
            .then(response => {
              segment.data.segmentation_id = response.data.segmentation_id;
              annotate.setState({
                isSegmentSaving: false,
                selectedSegment: segment,
                successMessage: 'Segment saved',
                errorMessage: null
              });
              wavesurferMethods.styleRegionColor(segment, 'rgba(0, 0, 0, 0.7)');
              segment._onSave();
            })
            .catch(error => {
              console.error(error);
              annotate.setState({
                isSegmentSaving: false,
                errorMessage: 'Error saving segment',
                successMessage: null
              });
            });
        } else {
          axios({
            method: 'put',
            url: `${segmentationUrl}/${segmentation_id}`,
            data: {
              start,
              end,
              annotations,
              time_spent
            }
          })
            .then(() => {
              annotate.setState({
                isSegmentSaving: false,
                successMessage: 'Segment saved',
                errorMessage: null
              });
              wavesurferMethods.styleRegionColor(segment, 'rgba(0, 0, 0, 0.7)');
              segment._onSave();
            })
            .catch(error => {
              console.error(error);
              annotate.setState({
                isSegmentSaving: false,
                errorMessage: 'Error saving segment',
                successMessage: null
              });
            });
        }
      } catch (err) {
        console.error(err);
      }
    }
  });
};

export const handleSegmentDelete = annotate => {
  const { wavesurfer, selectedSegment, segmentationUrl } = annotate.state;
  annotate.setState({ isSegmentDeleting: true });
  if (selectedSegment.data.segmentation_id) {
    axios({
      method: 'delete',
      url: `${segmentationUrl}/${selectedSegment.data.segmentation_id}`
    })
      .then(() => {
        annotate.removeSegment(wavesurfer, selectedSegment);
      })
      .catch(error => {
        console.error(error);
        annotate.setState({
          isSegmentDeleting: false
        });
      });
  } else {
    annotate.removeSegment(wavesurfer, selectedSegment);
  }
};
