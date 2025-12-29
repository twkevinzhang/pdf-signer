import React, { useState, useEffect, useRef, createRef, useReducer, MouseEventHandler } from 'react';
import { Image, Image as Component } from './Image';
import { Position, ResizableDelta, Rnd } from 'react-rnd';
import { DraggableData, DraggableEvent } from 'react-draggable';
import { Direction } from 're-resizable/lib/resizer';
import { DraggableImage } from '../containers/DraggableImage';
import { readAsDataURL, readAsImage } from '../utils/asyncReader';
import { v4 as uuidv4 } from 'uuid';
import { AttachmentTypes } from '../entities';
import { scaleTo } from '../utils/helpers';
import { Candidate } from './Candidate';

interface Props {
  attachment: ImageAttachment
  onClick?: MouseEventHandler;
  scale?: number;
  active?: boolean;
}

const IMAGE_MAX_SIZE = 90;
export const CandidateImage = (
  {
    attachment,
    onClick,
    scale = 1,
    active = false,
}: Props) => {
  function getScaledImage(attachment: ImageAttachment): ImageAttachment{
    const { width, height } = scaleTo(
      attachment.width,
      attachment.height,
      IMAGE_MAX_SIZE,
    )
    return {
      ...attachment,
      x: attachment.x * scale,
      y: attachment.y * scale,
      width: width * scale,
      height: height * scale,
    }
  }

  const style = active? {
    borderColor: "#1eb99d",
    borderStyle: 'solid',
  } : {}

  return (
    <Candidate
      onClick={onClick}
      style={style}
    >
      <Image
        {...getScaledImage(attachment)}
        style={{
          cursor: 'pointer'
        }}
      />
    </Candidate>
  )
};
