import React from 'react'
export const Heading = (props: {
  text: string
}): JSX.Element => {
  return (
    <h1>
      {props.text}
    </h1>
  )
}

