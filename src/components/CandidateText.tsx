import React, {
  useState,
  useEffect,
  useRef,
  createRef,
  useReducer,
  ReactNode,
  MouseEventHandler,
  CSSProperties,
} from 'react';
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
import { Button } from 'react-bootstrap';

interface Props {
  children?:ReactNode | null,
  onClick?: MouseEventHandler;
  scale?: number;
  active?: boolean;
}

export const CandidateText = (
  {
    onClick,
    children,
    scale,
    active
  }: Props) => {

  const style: CSSProperties = active? {
    borderStyle: 'solid',
    borderColor: "#1eb99d",
  } : {}
  return (
    <Candidate>
      <Button
        style={{
          width: '100%',
          height: '5rem',
          ...style,
        }}
        onClick={onClick}>
        {children}
      </Button>
    </Candidate>
  )
};
