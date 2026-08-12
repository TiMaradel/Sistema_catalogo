import { createContext, useContext, useState, useEffect } from 'react'
import { onAuthChange, getUserData } from '@/services/authService'
import { getStoreByOwnerId } from '@/services/storeService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [store, setStore] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthChange(async (authUser) => {
      if (authUser) {
        setUser(authUser)
        try {
          const data = await getUserData(authUser.uid)
          setUserData(data)

          if (data?.storeId) {
            const { getStoreById } = await import('@/services/storeService')
            const storeData = await getStoreById(data.storeId)
            setStore(storeData)
          } else {
            const storeData = await getStoreByOwnerId(authUser.uid)
            setStore(storeData)
          }
        } catch (error) {
          console.error('Erro ao carregar dados do usuário:', error)
        }
      } else {
        setUser(null)
        setUserData(null)
        setStore(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const refreshStore = async () => {
    if (!user) return
    try {
      if (userData?.storeId) {
        const { getStoreById } = await import('@/services/storeService')
        const storeData = await getStoreById(userData.storeId)
        setStore(storeData)
      } else {
        const storeData = await getStoreByOwnerId(user.uid)
        setStore(storeData)
      }
    } catch (error) {
      console.error('Erro ao atualizar loja:', error)
    }
  }

  const value = {
    user,
    userData,
    store,
    loading,
    isAuthenticated: !!user,
    isAdmin: userData?.role === 'admin' || userData?.role === 'superadmin',
    isSuperAdmin: userData?.role === 'superadmin',
    refreshStore,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

export default AuthContext
