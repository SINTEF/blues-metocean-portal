import { Layout } from 'antd'
import React, { ReactNode } from 'react'
import styled from 'styled-components'

import { backgroundColorDefault, backgroundColorLight, appTextColor } from './Colors'
import { Heading } from './Heading'

const PageHeading = styled.div`
  padding: 20px;
  background-color: ${backgroundColorLight};
`

const PageContent = styled.div`
  padding: 20px;
  background-color: ${backgroundColorDefault};
`
const Content = (props: {
  heading: string
  content: ReactNode
}): JSX.Element => {
  const { heading, content } = props

  return (
    <Layout style={{ margin: '0px 0px 10px 0px', color: appTextColor }}>
      <PageHeading>
        <Heading text={heading} />
      </PageHeading>
      <PageContent>{content}</PageContent>
    </Layout>
  )
}
export default Content