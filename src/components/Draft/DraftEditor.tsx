"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Bold,
  Italic,
  Underline,
  List,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react";
import {
  Editor,
  EditorState,
  RichUtils,
  ContentBlock,
  DraftStyleMap,
  DraftHandleValue,
} from "draft-js";
import "draft-js/dist/Draft.css";

interface Color {
  label: string;
  style: string;
}

interface DraftEditorProps {
  editorState: EditorState;
  setEditorState: (state: EditorState) => void;
  blockStyleFn: (state: ContentBlock) => string;
}

const COLORS: Color[] = [
  { label: "Black", style: "BLACK" },
  { label: "Red", style: "RED" },
  { label: "Green", style: "GREEN" },
  { label: "Blue", style: "BLUE" },
  { label: "Orange", style: "ORANGE" },
  { label: "Purple", style: "PURPLE" },
];

const customStyleMap: DraftStyleMap = {
  BLACK: { color: "black" },
  RED: { color: "#D0312D" },
  GREEN: { color: "#3CB043" },
  BLUE: { color: "#1338BE" },
  ORANGE: { color: "#FFA500" },
  PURPLE: { color: "#800080" },
  H1: { fontSize: "2em", fontWeight: "bold" },
  H2: { fontSize: "1.5em", fontWeight: "bold" },
  H3: { fontSize: "1.17em", fontWeight: "bold" },
};

const DraftEditor: React.FC<DraftEditorProps> = ({
  editorState,
  setEditorState,
  blockStyleFn,
}) => {
  const handleKeyCommand = (
    command: string,
    editorState: EditorState
  ): DraftHandleValue => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  };

  const toggleInlineStyle = (style: string): void => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, style));
  };

  const toggleBlockType = (blockType: string): void => {
    setEditorState(RichUtils.toggleBlockType(editorState, blockType));
  };

  const toggleAlignment = (alignment: string): void => {
    // Convert alignment to block type
    const blockType = `align-${alignment}`;
    // console.log("blockType alignment", blockType);
    // Toggle the block type
    const newState = RichUtils.toggleBlockType(editorState, blockType);
    // console.log("newState alignment", newState);
    setEditorState(newState);
    // console.log("editorState", editorState);
  };

  const currentInlineStyle = editorState.getCurrentInlineStyle();
  const selection = editorState.getSelection();

  const currentBlockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();

  // Get current alignment from block type
  const currentAlignment = currentBlockType.startsWith("align-")
    ? currentBlockType.split("-")[1]
    : "center";

  console.log(editorState.getCurrentContent().getBlockMap().toArray());
  return (
    <div className='border rounded-md p-2 h-full'>
      <div className='mb-2 flex flex-wrap gap-2'>
        <Button
          variant='outline'
          size='icon'
          onClick={() => toggleInlineStyle("BOLD")}
        >
          <Bold className='h-4 w-4' />
          <span className='sr-only'>Toggle bold</span>
        </Button>
        <Button
          variant='outline'
          size='icon'
          onClick={() => toggleInlineStyle("ITALIC")}
        >
          <Italic className='h-4 w-4' />
          <span className='sr-only'>Toggle italic</span>
        </Button>
        <Button
          variant='outline'
          size='icon'
          onClick={() => toggleInlineStyle("UNDERLINE")}
        >
          <Underline className='h-4 w-4' />
          <span className='sr-only'>Toggle underline</span>
        </Button>
        <Button
          variant='outline'
          size='icon'
          onClick={() => toggleBlockType("unordered-list-item")}
        >
          <List className='h-4 w-4' />
          <span className='sr-only'>Toggle unordered list</span>
        </Button>
        <Button
          variant={currentInlineStyle.has("H1") ? "secondary" : "outline"}
          size='icon'
          onClick={() => toggleInlineStyle("H1")}
        >
          <Heading1 className='h-4 w-4' />
          <span className='sr-only'>Toggle H1</span>
        </Button>
        <Button
          variant={currentInlineStyle.has("H2") ? "secondary" : "outline"}
          size='icon'
          onClick={() => toggleInlineStyle("H2")}
        >
          <Heading2 className='h-4 w-4' />
          <span className='sr-only'>Toggle H2</span>
        </Button>
        <Button
          variant={currentInlineStyle.has("H3") ? "secondary" : "outline"}
          size='icon'
          onClick={() => toggleInlineStyle("H3")}
        >
          <Heading3 className='h-4 w-4' />
          <span className='sr-only'>Toggle H3</span>
        </Button>

        {/* <Button
          variant={currentAlignment === "left" ? "secondary" : "outline"}
          size='icon'
          onClick={() => toggleAlignment("left")}
        >
          <AlignLeft className='h-4 w-4' />
          <span className='sr-only'>Align left</span>
        </Button>
        <Button
          variant={currentAlignment === "center" ? "secondary" : "outline"}
          size='icon'
          onClick={() => toggleAlignment("center")}
        >
          <AlignCenter className='h-4 w-4' />
          <span className='sr-only'>Align center</span>
        </Button>
        <Button
          variant={currentAlignment === "right" ? "secondary" : "outline"}
          size='icon'
          onClick={() => toggleAlignment("right")}
        >
          <AlignRight className='h-4 w-4' />
          <span className='sr-only'>Align right</span>
        </Button> */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant='outline'>Color</Button>
          </PopoverTrigger>
          <PopoverContent className='w-40'>
            <div className='grid grid-cols-3 gap-2'>
              {COLORS.map((color) => (
                <Button
                  key={color.style}
                  className='w-8 h-8 p-0'
                  style={{ backgroundColor: customStyleMap[color.style].color }}
                  onClick={() => toggleInlineStyle(color.style)}
                >
                  <span className='sr-only'>
                    Set text color to {color.label}
                  </span>
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className='prose max-w-none'>
        <Editor
          editorState={editorState}
          onChange={setEditorState}
          handleKeyCommand={handleKeyCommand}
          customStyleMap={customStyleMap}
          blockStyleFn={blockStyleFn}
        />
      </div>
    </div>
  );
};

export default DraftEditor;
