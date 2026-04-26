/**
 * App.jsx
 * Route table for the SPA. Each page component is labeled ASSIGNMENT 3 — VIEW n in its file header.
 * React Router uses in-app relative paths; public env vars document client/API bases for deploy.
 */

import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AppDataProvider } from './context/AppDataContext'
import { HomePage } from './pages/HomePage'
import { AuthPage } from './pages/AuthPage'
import { RecipesPage } from './pages/RecipesPage'
import { RecipeDetailPage } from './pages/RecipeDetailPage'
import { AddRecipePage } from './pages/AddRecipePage'
import { FavouritesPage } from './pages/FavouritesPage'
import { MealPlanPage } from './pages/MealPlanPage'
import { ProfilePage } from './pages/ProfilePage'
import './App.css'

export default function App() {
  return (
    <AppDataProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
          <Route path="/add-recipe" element={<AddRecipePage />} />
          <Route path="/favourites" element={<FavouritesPage />} />
          <Route path="/meal-plan" element={<MealPlanPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </AppDataProvider>
  )
}
