import { UUID } from "crypto";

export type Page = 'Account' | 'Support';

export type ActivePage = Page;

export type PageFetchState = 'loading' | 'error' | 'idle';

export type AccountType = 'Regular' | 'Pocket';

export type Currency = 'DKK' | 'SEK' | 'NOK' | 'USD' | 'EUR';

export type ChatWindowType = 'Minimized' | 'Open' | 'Full_Size';

export type USER_ID = UUID;

export type WeekDayInformation = {
	weekDay: string,
	dayNumbers: number,

}

export type ErrorState = {
	error: string,
	errorCode: number
}

export type USER_MESSAGE = {
	message: string,
	sent: Date
}

export type DayTimeStats = {
	time: string,
	avgClients: number,
}

export type ChatMessage = {
	by: USER_ID,
	createDate: Date
	message: string
}

export type User = {
	id: USER_ID,
	firstName: string,
	lastName: string,
	email: string
}

export type APP_STATE = {
	page: Page,
	activePage: ActivePage,
	user: User
	accountPage: {
		accounts: [
			{
				information: {
					name: string
					IBAN: string,
					localCurreny: Currency
				},
				type: AccountType
			},
			{
				information: {
					name: string
					IBAN: string,
					localCurreny: Currency,
					pocketCurrency?: Currency
				},
				type: AccountType
			},
		]
		pageState: PageFetchState,
		pageErrors: ErrorState[]
	},
	supportPage: {
		chatActive: boolean,
		queue: {
			queueCount: number
		},
		supportInfo: {
			days: {
				[key: string]: {
					times: DayTimeStats[]
				}
			}
		}
		userMessage: string,
		userMessageThread: USER_MESSAGE[]
	},
	chat: {
		chatState: ChatWindowType,
		chatConnected: boolean,
		chatAgent: string,
		chatMessage: ChatMessage,
		chatMessages: ChatMessage[],
		chatInformationFetched: PageFetchState
	}
}
