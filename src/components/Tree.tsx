import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { SimpleTreeView as TreeView }  from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { Checkbox, FormControlLabel } from '@mui/material';
import React from 'react';

export interface TreeNode {
  id: string;
  label: string;
  color?: string
  checked?: boolean;
  data?: any,
  items?: TreeNode[];
}

export interface TreeProps {
  data: TreeNode[];
  onSelection?: (node: TreeNode) => void;
}

export const Tree: React.FC<TreeProps> = ({ data,onSelection }) => {

  function onChange(event:any,node: TreeNode){
    node.checked=event.target.checked
    if(onSelection){
      onSelection(node)
    }
  }

  const renderControl = (node: TreeNode) =>{
    if(node.items){
      return <div></div>
    }
    return <Checkbox onChange={event=>onChange(event,node)} style={{ color: node.color }} checked={node.checked}></Checkbox>
  }
  const renderItem = (node: TreeNode) =>{
    return <FormControlLabel control={renderControl(node)} label={node.label}></FormControlLabel>
  }

  const renderTree = (nodes: TreeNode[]) => {
    return nodes.map((node) => (
      <TreeItem key={node.id} itemId={node.id} label={renderItem(node)}>
        {node.items && renderTree(node.items)}
      </TreeItem>
    ));
  };

  return (
    <TreeView
      sx={{margin: 2}}
      defaultExpandedItems={['root']}
      slots={{ expandIcon: ExpandMoreIcon, collapseIcon: ChevronRightIcon }}
    >
      {renderTree(data)}
    </TreeView>
  );
};
