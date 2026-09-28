import { createBrowserRouter, RouterProvider } from "react-router";
import Layout from '../components/Layout/Layout'
import PokemonGrid from "../features/pokemon/components/PokemonGrid/PokemonGrid";
import PokemonDetails from "../features/pokemon/pages/PokemonDetails/PokemonDetails";

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <PokemonGrid />
      },
      {
        path: 'pokemon/:id',
        element: <PokemonDetails />
      }
    ]
  }
])

function Router () {
  return <RouterProvider router={router} />
}

export default Router