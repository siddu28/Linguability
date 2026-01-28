import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

function Logout() {
    const navigate = useNavigate()

    useEffect(() => {
        async function run() {
            await supabase.auth.signOut()
            navigate('/login', { replace: true })
        }

        run()
    }, [navigate])

    return null
}

export default Logout
