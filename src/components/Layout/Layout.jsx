import styles from './Layout.module.css'
import Header from '../Header/Header'
import Footer from '../Footer/Footer'
import { Outlet } from 'react-router'

function Layout() {
  return(
    <div>
      <Header />
      <Outlet />
      <Footer />
    </div>
  )
}

export default Layout