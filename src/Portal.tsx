import { Layout } from 'antd'
import React from 'react'
import { ReactNode } from 'react'
import { Route, Routes } from 'react-router-dom'

import { backgroundColorDefault } from './layout/Colors'
import Content from './layout/Content'
import ResponsiveAppBar from './layout/ResponsiveAppBar'

import AppOverview from './AppOverview'
import { DatasetOverview } from './components/datasets/DatasetOverview'
import { PostOverview } from './components/postprocessing/PostOverview'


const MainLayout = (props: { heading: string, content: ReactNode }) => {

  const { heading, content } = props

  return (
    <>
      <ResponsiveAppBar appName="Metocean Portal"></ResponsiveAppBar>
      <Layout style={{ background: backgroundColorDefault }}>
        <Content heading={heading} content={content} />
      </Layout>
    </>
  )
}

const ROUTES = [
  {
    path: '/',
    heading: 'Home',
    content: <AppOverview />,
  },
  {
    path: '/datasets',
    heading: 'Datasets',
    content: <DatasetOverview />,
  }
  ,
  {
    path: '/postprocessing',
    heading: 'Post processing',
    content: <PostOverview />,
  }
]

const Portal = (): JSX.Element => {

  return (
    <>
      <Routes>
        {ROUTES.map((route) => (
          <Route
            path={`${route.path}`}
            element={
              <MainLayout
                heading={route.heading}
                content={route.content}
              />
            }
            key={route.path}
          />
        ))}
      </Routes>
    </>
  )
}
export default Portal

