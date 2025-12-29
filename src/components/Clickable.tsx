import React, { MouseEventHandler, useEffect, useRef, useState } from 'react';
import { Page } from './Page';
import { Attachments } from './Attachments';
import { mockPlacements } from '../models/MockPlacements';
import { Card } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';
import { getResizedAttachment, whichPlacement } from '../utils/helpers';
import { MouseContext } from '../contexts/MouseContext';

interface Props {
  children?: React.ReactNode | null;
  onClick?: (x: number, y: number) => void;
  handleAttachment?: Attachment;
  addAttachment?: (attachment: Attachment) => void;
  scale?: number;
}
export const Clickable = (
  {
    children,
    onClick,
    handleAttachment,
    addAttachment,
    scale =1,
    ...event
  }: Props & Partial<MyMouseEvent>) => {
  const handleClick = ()=> {
    if(!event.passivePosition) return
    let { x, y } = event.passivePosition
    if (handleAttachment && addAttachment) {
      x = x/scale
      y = y/scale
      let placement= whichPlacement(x, y, mockPlacements())
      if(placement){
        const attachment = getResizedAttachment(handleAttachment, placement);
        addAttachment({
          ...attachment,
          id: uuidv4(),
        })
      }else{
        addAttachment({
          ...handleAttachment,
          x,
          y,
          id: uuidv4(),
        })
      }
    }
    if(onClick)
      onClick(event.passivePosition.x, event.passivePosition.y)
  }
  return <div
    onClick={handleClick}
  >
    <MouseContext.Provider value={event as MyMouseEvent}>
      {children}
    </MouseContext.Provider>
  </div>
};
