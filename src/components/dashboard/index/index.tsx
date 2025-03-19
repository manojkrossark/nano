import DashboardBody from "./DashboardBody"
import dynamic from 'next/dynamic'
const DynamicComponentWithNoSSR = dynamic(
  () => import('./DashboardBody'),
  { ssr: false }
)
const DashboardIndex = () => {
  return (
    <>
      <DynamicComponentWithNoSSR/>
    </>
  )
}

 


export default DashboardIndex



