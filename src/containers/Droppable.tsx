import React, { CSSProperties } from 'react';
import {useDroppable, UniqueIdentifier} from '@dnd-kit/core';



interface Props {
  children: React.ReactNode | null;
  id: UniqueIdentifier;
  x: number;
  y: number;
  width: number,
  height: number,
}

export function Droppable(
  {
    children,
    id,
    x,
    y,
    width,
    height,
  }: Props) {
  const {isOver, setNodeRef} = useDroppable({
    id,
  });

  let border: CSSProperties ={
    color: 'gray',
    borderStyle: 'dashed',
    borderWidth: '1px',
  }
  if(isOver){
    border = {
      boxShadow: "inset #1eb99d 0 0 0 3px, rgba(201, 211, 219, 0.5) 20px 14px 24px"
    }
  }

  if(children){
    border={
      color:'rgb(245, 101, 101)',
      borderStyle: 'solid',
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        width,
        height,
        position: 'absolute',
        left: `${x ?? 0}px`,
        top: `${y ?? 0}px`,
        // backgroundColor: "#fff",
        ...border,
      }}
    >
      {children}
    </div>
  );
}

