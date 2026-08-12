// Autenticação local para desenvolvimento. Não substitui um backend em produção.
import { generateLocalId, readLocalData, writeLocalData } from '@/services/localStorageService'
import { ensureDemoCatalog } from '@/services/demoCatalogService'

const USERS_KEY = 'cat_users'
const CURRENT_USER_KEY = 'cat_current_user'

function getUsers() {
  return readLocalData(USERS_KEY, {})
}

function saveUsers(users) {
  writeLocalData(USERS_KEY, users)
}

function notifyAuthChange() {
  window.dispatchEvent(new Event('catalog-auth-change'))
}

export async function registerUser(email, password, name, role = 'admin', autoLogin = true) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const users = getUsers()
        const normalizedEmail = String(email).trim().toLowerCase()
        const existingUser = Object.values(users).find(u => u.email === normalizedEmail)
        if (existingUser) {
          return reject({ code: 'auth/email-already-in-use', message: 'E-mail já está em uso.' })
        }

        const uid = generateLocalId()
        const newUser = {
          uid,
          email: normalizedEmail,
          password, // Na vida real NUNCA salve senhas em texto plano
          name: String(name).trim(),
          role,
          createdAt: new Date().toISOString(),
        }
        users[uid] = newUser
        saveUsers(users)
        if (autoLogin) {
          localStorage.setItem(CURRENT_USER_KEY, uid)
          notifyAuthChange()
        }
        resolve({ uid, email: normalizedEmail, name: newUser.name, role })
      } catch (error) {
        reject(error)
      }
    }, 500)
  })
}

export async function loginUser(email, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const users = getUsers()
        const normalizedEmail = String(email).trim().toLowerCase()
        const user = Object.values(users).find(u => u.email === normalizedEmail && u.password === password)
        if (!user) return reject({ code: 'auth/wrong-password', message: 'E-mail ou senha incorretos.' })
        localStorage.setItem(CURRENT_USER_KEY, user.uid)
        notifyAuthChange()
        resolve(user)
      } catch (error) {
        reject(error)
      }
    }, 500)
  })
}

export async function logoutUser() {
  return new Promise((resolve) => {
    setTimeout(() => {
      localStorage.removeItem(CURRENT_USER_KEY)
      notifyAuthChange()
      resolve()
    }, 300)
  })
}

export async function updateUserData(uid, data) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const users = getUsers()
        if (!users[uid]) return reject(new Error('Usuário não encontrado'))
        users[uid] = { ...users[uid], ...data }
        saveUsers(users)
        notifyAuthChange()
        resolve(users[uid])
      } catch (error) {
        reject(error)
      }
    }, 300)
  })
}

export async function resetPassword(email) {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Reset password email "sent" to ${email}`)
      resolve()
    }, 500)
  })
}

export async function deleteUser(uid) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const users = getUsers()
        if (!users[uid]) return reject(new Error('Usuário não encontrado'))
        delete users[uid]
        saveUsers(users)
        if (localStorage.getItem(CURRENT_USER_KEY) === uid) {
          localStorage.removeItem(CURRENT_USER_KEY)
          notifyAuthChange()
        }
        resolve()
      } catch (error) {
        reject(error)
      }
    }, 200)
  })
}

export async function getUserData(uid) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = getUsers()
      resolve(users[uid] || null)
    }, 100)
  })
}

export function onAuthChange(callback) {
  function emitCurrentUser() {
    const uid = localStorage.getItem(CURRENT_USER_KEY)
    if (uid) {
      const users = getUsers()
      const userData = users[uid]
      if (userData) {
        callback({ uid: userData.uid, email: userData.email })
      } else {
        callback(null)
      }
    } else {
      callback(null)
    }
  }

  const handleChange = () => emitCurrentUser()
  window.addEventListener('catalog-auth-change', handleChange)
  window.addEventListener('storage', handleChange)
  setTimeout(emitCurrentUser, 100)

  return () => {
    window.removeEventListener('catalog-auth-change', handleChange)
    window.removeEventListener('storage', handleChange)
  }
}

export async function guestLogin() {
  const email = 'teste@local.com'
  const password = 'testepassword'

  let user = null
  try {
    user = await loginUser(email, password)
  } catch {
    // Se falhar o login, significa que não existe ainda. Vamos criar.
  }

  const { createStore, getStoreByOwnerId } = await import('@/services/storeService')
  if (!user) {
    user = await registerUser(email, password, 'Usuário de Teste', 'admin', false)
  }

  if (!user?.uid) throw new Error('Não foi possível preparar o usuário de teste')

  const existingStore = await getStoreByOwnerId(user.uid)
  if (!existingStore) {
    const storeId = await createStore({
      name: 'Ateliê Aurora',
      slug: 'loja-teste',
      whatsapp: '5511999999999',
      logo: '',
      description: 'Uma curadoria de peças leves, versáteis e feitas para acompanhar sua rotina.',
      layout: 'modern',
      theme: 'light',
      socialLinks: {},
      ownerId: user.uid,
      plan: 'free',
    })
    await updateUserData(user.uid, { storeId })
  }

  ensureDemoCatalog(user.uid)

  if (localStorage.getItem(CURRENT_USER_KEY) !== user.uid) {
    await loginUser(email, password)
  }
}
