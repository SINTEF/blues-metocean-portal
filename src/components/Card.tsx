import styled from 'styled-components'

export const cardTextColor = '#333'
export const cardBackgroundColor = '#40c1ac'

export const ErrorGroup = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(213, 18, 18, 0.71);
  border-radius: 5px;
  padding: 20px 20px;
  background-color: #f6dfdf;
`

export const CardWrapper = styled.div`
  border: #e6e6e6 1px solid;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  color: ${cardTextColor};
  background: ${cardBackgroundColor};
`
