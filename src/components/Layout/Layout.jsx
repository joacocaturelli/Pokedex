import styles from './Layout.module.css'
import Header from '../Header/Header'
import Footer from '../Footer/Footer'
import { Outlet } from 'react-router'

function Layout() {
  return(
    <>
      <Header />
        <main>
          <Outlet />
        </main>
      <Footer />
    </>
  )
}

export default Layout