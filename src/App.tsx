import './App.css'
import { Item, Menu } from '@/components/Menu'

const App = () => {
	return (
		<Menu renderTrigger={(props) => {
			return <button {...props}>Actions</button>
		}}>
			<Item key="copy">Copy application</Item>
			<Item key="rename">Rename application</Item>
			<Item key="move" title="Move to">
				<Item key="move-to-shared">Shared</Item>
				<Item key="move-to-desktop">Desktop</Item>
				<Item key="move-to-favorite">Favorite</Item>
			</Item>
			<Item key="delete">Delete application</Item>
		</Menu>
	)
}

export default App
