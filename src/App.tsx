import React, { useEffect, useState } from 'react';
import './App.css';
import { Pdf, usePdf } from './hooks/usePdf';
import { Button, Card, Col, Container, Nav, Row } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAttachments } from './hooks/useAttachments';
import { AttachmentTypes } from './entities';
import { Attachments as PageAttachments } from './components/Attachments';
import { UploadTypes, useUploader } from './hooks/useUploader';
import { v4 as uuidv4 } from 'uuid';
import { CandidateImage } from './components/CandidateImage';
import { useDrawer } from './hooks/useDrawer';

import { BsChevronLeft, BsChevronRight, BsFillCloudDownloadFill, BsFillCloudUploadFill } from 'react-icons/bs';
import { mockPlacements } from './models/MockPlacements';
import { getResizedAttachment, scaleTo, whichPlacement } from './utils/helpers';
import { CandidateText } from './components/CandidateText';
import { saveImageFile } from './utils/StorageService';
import ReactInputPosition from "react-input-position";
import { Clickable } from './components/Clickable';
import { Page } from './components/Page';
import { Scrollable } from './components/Scrollable';

const App: React.FC<{}> = () => {
  const [ scale, setScale ] = useState(1.65);
  const [ handleAttachment, setHandleAttachment ] = useState<Attachment | undefined>();
  const { file, setPdf, pageIndex, isMultiPage, isFirstPage, isLastPage, currentPage, isSaving, savePdf, previousPage, nextPage, setDimensions, name, dimensions } = usePdf();
  const { allCandidates, removeAllImages, refresh: refreshDrawer } = useDrawer();
  const { addAttachment, allPageAttachments, pageAttachments, resetAttachments, updateAttachments, removeAttachments, setPageIndex } = useAttachments();
  const isPdfLoaded = !!file

  const { inputRef: pdfRef, handleUpload: handlePdfUpload, fileOnChange: pdfOnChange } = useUploader({
    use: UploadTypes.PDF,
    afterUploadPdf: (uploaded: Pdf)=>{
      setPdf(uploaded);
      const numberOfPages = uploaded.pages.length;
      resetAttachments(numberOfPages)
    }
  });

  const { inputRef: imgRef, handleUpload: handleImageUpload, fileOnChange: imgOnChange } = useUploader({
    use: UploadTypes.IMAGE,
    afterUploadImage: (attachment: ImageAttachment)=>{
        saveImageFile(attachment.file, attachment.id).then(()=>refreshDrawer());
        setHandleAttachment(attachment)
      }
  });

  useEffect(() => setPageIndex(pageIndex), [pageIndex, setPageIndex]);

  const handleText = () => {
    const newTextAttachment: TextAttachment = {
      id: uuidv4(),
      type: AttachmentTypes.TEXT,
      x: 0,
      y: 0,
      width: 120,
      height: 25,
      fontSize: 16,
      lineHeight: 1.4,
      fontFamily: 'Times-Roman',
      text: 'Enter Text Here',
    };
    setHandleAttachment(newTextAttachment)
  };

  const handleSave = () => savePdf(allPageAttachments)

  const message =
    handleAttachment? "點擊 PDF 的某處來新增附件": "這些圖片被儲存在 local 的 IndexedDB。"

  const hiddenInputs = (
    <>
      <input
        ref={pdfRef}
        type="file"
        accept="application/pdf"
        onChange={pdfOnChange}
        style={{ display: 'none' }}
      />
      <input
        ref={imgRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={imgOnChange}
      />
    </>
  )

  let previousButtonStyle= {}
  if(!isMultiPage || isFirstPage){
    previousButtonStyle={
      visibility:'hidden'
    }
  }

  let nextPageStyle= {}
  if(!isMultiPage || isLastPage){
    nextPageStyle={
      visibility:'hidden'
    }
  }

    return (
    <div className="App">
      {hiddenInputs}

      <Container fluid>
        {!isPdfLoaded && (<>
        <Row className='justify-content-center mt-lg-5'>
          <div>
            <h3>上傳一份 Pdf！</h3>
            <Button onClick={handlePdfUpload}><BsFillCloudUploadFill /> Upload</Button>
          </div>
        </Row>
        </>)}
        <Row>
          <Col sm={3}>
            {isPdfLoaded && (
              <div className="flex-nowrap" style={{
                overflowY: 'scroll',
                height: '100vh',
              }}>
              <h3>加入附件</h3>
              <p>
                {message}
                <Button variant="link" onClick={removeAllImages}>清空圖片</Button>
              </p>
              <CandidateText
                active={handleAttachment?.type === AttachmentTypes.TEXT}
                scale={scale}
                onClick={handleText}>
                新增文字
              </CandidateText>
              {allCandidates
                .filter(attachment=>attachment.type === AttachmentTypes.IMAGE)
                .map(attachment=>{
                  console.log(handleAttachment?.id)
                  return <div key={attachment.id} id={attachment.id}><CandidateImage
                    active={handleAttachment?.id === attachment.id}
                    onClick={()=>{
                      setHandleAttachment(attachment)
                    }}
                    attachment={attachment as ImageAttachment}
                    scale={scale}
                  /></div>
                })
              }
              <CandidateText scale={scale} onClick={handleImageUpload}>
                上傳圖片
              </CandidateText>
            </div>)}
          </Col>
          <Col sm={9} className='position-relative'>
            <div className="d-flex justify-content-between align-items-center" style={{
              height: '7vh',
              minHeight: "40px",
            }}>
              <div>
                <Button style={previousButtonStyle} className='rounded-circle' variant="outline-dark" onClick={previousPage}><BsChevronLeft /></Button>
              </div>
              <div>
                {isPdfLoaded && (<Nav className="justify-content-center">
                  <Nav.Link onClick={handlePdfUpload}><BsFillCloudUploadFill /> Upload New</Nav.Link>
                  <Nav.Link onClick={handleSave}><BsFillCloudDownloadFill /> Save </Nav.Link>
                </Nav>)}
              </div>

              <div>
                <Button style={nextPageStyle} className='rounded-circle' variant="outline-dark" onClick={nextPage}><BsChevronRight /></Button>
              </div>
            </div>
            <Scrollable>
            { currentPage && (
              <ReactInputPosition
                trackPassivePosition={true}
                cursorStyle={handleAttachment ? undefined : 'default'}
              >
                <Clickable
                  handleAttachment={handleAttachment}
                  addAttachment={addAttachment}
                  scale={scale}
                >
                  <Card
                    style={{
                      display: 'table', // for look more compact
                    }}
                  >
                    <Page
                      dimensions={dimensions}
                      setDimensions={setDimensions}
                      page={currentPage}
                      scale={scale}
                    />
                    { dimensions && (
                      <PageAttachments
                        removeAttachment={removeAttachments}
                        updateAttachment={updateAttachments}
                        pageDimensions={dimensions}
                        attachments={pageAttachments}
                        placements={mockPlacements()}
                        scale={scale} />
                    )}
                  </Card>
                </Clickable>
              </ReactInputPosition>
            )}
            </Scrollable>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
