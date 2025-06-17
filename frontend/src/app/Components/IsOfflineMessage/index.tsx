'use client'
import {message} from 'antd'
import {useEffect, useId, useSyncExternalStore} from 'react'

function subscribe(cb: () => void) {
	window.addEventListener('online', cb)
	window.addEventListener('offline', cb)
	return () => {
		window.removeEventListener('online', cb)
		window.removeEventListener('offline', cb)
	}
}

export function useOnline() {
	const isOnline = useSyncExternalStore(
		subscribe,
		() => navigator.onLine,
		() => true,
	)
	return isOnline
}

export const IsOfflineMessage: React.FC = () => {
	const isOnline = useOnline()
	const [messageApi, contextHolder] = message.useMessage()
	const key = useId()

	useEffect(() => {
		if (!isOnline) {
			messageApi.error({
				content: 'Вы отключились от сети',
				duration: -1,
				key,
				style: {fontSize: '1.1rem'},
			})
		} else {
			messageApi.destroy(key)
		}
		return () => {
			messageApi.destroy(key)
		}
	}, [isOnline, key, messageApi])
	return <>{contextHolder}</>
}
