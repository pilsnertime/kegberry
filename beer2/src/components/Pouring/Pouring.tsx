import React from 'react';
import { Pour } from '../Pour/Pour';

export function Pouring(props: any) {

  return (
    <Pour pourFinished={props.pourFinished}></Pour>
  );
}