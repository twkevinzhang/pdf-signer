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

interface Props {
  children?:ReactNode | null,
  onClick?: MouseEventHandler;
  style?: CSSProperties;
}

export const Candidate = (
  {
    children,
    onClick,
    style,
  }: Props) => {

  return (
    <div
      onClick={onClick}
      style={{
        margin: '0.5rem',
        float: 'left',
        ...style,
      }}
    >
      {children}
  </div>
  )
};
