import React, { useState, useRef, useEffect, createRef, CSSProperties } from 'react';
import { DragActions, TextMode } from '../entities';
import { DraggableData, DraggableEvent, DraggableEventHandler } from 'react-draggable';
import { Rnd } from 'react-rnd';
import { Translate, useDraggable } from '@dnd-kit/core';
import { Text } from '../components/Text';
import { Stone } from '../components/Stone';
import { BsFillCheckCircleFill, BsPencil, BsXCircleFill } from 'react-icons/bs';

interface Props {
  pageWidth: number;
  pageHeight: number;
  removeText?: () => void;
  updateTextAttachment?: (textObject: Partial<TextAttachment>) => void;
  fontSize?: number,
  lineHeight?: number,
  fontFamily?: string,
  hidden?: boolean,
  x:number;
  y:number;
}

export const DraggableText = (
  {
    id,
   text,
   pageHeight,
   pageWidth,
   removeText,
   updateTextAttachment,
    fontSize,
    lineHeight,
    fontFamily,
    hidden = false,
    x,
    y,
}: TextAttachment & Props) => {
  const [content, setContent] = useState(text || '');
  const [editing, setEditing] = useState(false);

  const {attributes: draggableAttrs, node: inputRef, isDragging, listeners, setNodeRef} = useDraggable({
    id,
  });

  useEffect(()=>{
    if(editing){
      const input = inputRef.current;
      if (input) {
        input.focus();
        (input as HTMLInputElement).select();
      }
    }else{
      document.getSelection()?.removeAllRanges();
      if(content === '' && removeText){
        removeText()
      }else if(updateTextAttachment){
        const lines = [content];
        updateTextAttachment({
          lines,
          text: content,
        });
      }
    }
  },[editing])

  const onChangeText = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;
    setContent(value);
  };

  function handleEdit(e:React.MouseEvent){
    e.stopPropagation()
    setEditing(true)
  }

  function handleOk (e:React.FocusEvent | React.MouseEvent){
    e.stopPropagation()
    setEditing(false)
  }

  function handleRemoveText(e:React.MouseEvent){
    if(removeText){
      e.stopPropagation()
      removeText();
    }
  }

  function handleClick(e: React.MouseEvent){
    e.stopPropagation()
  }

  const okButton =
    <Stone
      position={{
        left: 0,
        top: 0,
        right: 0,
      }}
      translateX={"0"}
      translateY={"-50%"}
      style={{
        backgroundColor: 'white',
      }}
    >
      <BsFillCheckCircleFill
        onClick={handleOk}
        style={{
          cursor: 'pointer',
          color: '#1eb99d',
          width: "100%",
          height: "100%",
        }}/>
    </Stone>

  const deleteButton =
    <Stone
      position={{
        left: 0,
        top: 0,
        right: 0,
      }}
      translateX={"0"}
      translateY={"-50%"}
      style={{
        backgroundColor: 'white',
      }}
    >
      <BsXCircleFill
        onClick={handleRemoveText}
        style={{
          cursor: 'pointer',
          color:'rgb(245, 101, 101)',
          width: "100%",
          height: "100%",
        }}/>
    </Stone>

  let textStyle: CSSProperties = {
    borderWidth: '0.3px',
    borderColor: 'gray',
    borderStyle: editing? 'solid': 'dashed',
  }

  const hiddenStyle: CSSProperties = hidden
    ? {visibility: 'hidden',}
    : {}

  return (
    <div
      style={{
        position: "absolute",
        'left': `${x ?? 0}px`,
        'top': `${y ?? 0}px`,
        ...hiddenStyle
      }}
      onDoubleClick={handleEdit}
      onClick={handleClick}
      id={id}
    >
      {editing ? okButton : deleteButton}
      <Text
        ref={setNodeRef}
        listeners={listeners}
        draggableAttrs={draggableAttrs}
        onBlur={handleOk}
        text={content}
        fontSize={fontSize}
        lineHeight= { lineHeight }
        fontFamily={fontFamily}
        editing={editing}
        onChangeText={onChangeText}
        style={textStyle}
      />
    </div>
  )
};
