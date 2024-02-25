import React, {
	DOMAttributes,
	ReactElement,
	ReactNode,
	useRef
} from "react";
import { FocusScope } from "@react-aria/focus";
import { useMenu } from "@react-aria/menu";
import { useOverlayPosition } from "@react-aria/overlays";
import { useUnwrapDOMRef } from "@react-spectrum/utils";
import {
	DOMRefValue,
	FocusableElement,
	FocusableRef
} from "@react-types/shared";
import clsx from "clsx";

import { TreeState } from "@react-stately/tree";
import { Popover } from "../Popover";
import styles from "./Menu.module.css";


type PopOverSubItemPopoverSubItemProps<T> = {
	state: TreeState<T>;
	menuProps: DOMAttributes<FocusableElement>;
	menuRef: React.MutableRefObject<HTMLUListElement>;
	children: ReactNode,
	open: boolean
	onClose: () => void
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _PopoverSubItem = <T,>({ children, menuRef, state, menuProps, open = false }: PopOverSubItemPopoverSubItemProps<T>, ref: FocusableRef<HTMLLIElement>): JSX.Element => {
	const popoverRef = useRef<DOMRefValue<HTMLDivElement>>(null);
	const unwrappedPopoverRef = useUnwrapDOMRef(popoverRef);

	const { menuProps: subMenuProps } = useMenu({ ...menuProps, autoFocus: 'first', }, state, menuRef);

	const { overlayProps } = useOverlayPosition({
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		targetRef: ref,
		overlayRef: unwrappedPopoverRef,
		isOpen: true,
		placement: "right top",
		offset: 6,
		onClose: () => "onclose",
		shouldFlip: true,
	});

	return (
		<Popover
			isOpen={open}
			ref={popoverRef}
			style={overlayProps.style ?? {}}
			shouldCloseOnBlur
			onClose={() => { }}
			className={clsx(styles["sapphire-menu-container"])}
		>
			<FocusScope restoreFocus autoFocus>
				<ul {...subMenuProps} ref={menuRef} className={styles["sapphire-menu"]}>
					{children}
				</ul>
			</FocusScope>
		</Popover>
	)
}

export const PopoverSubItem = React.forwardRef(_PopoverSubItem) as <T extends object>(
	props: PopOverSubItemPopoverSubItemProps<T>,
	ref: FocusableRef<HTMLLIElement>
) => ReactElement;
/*
export const PopoverSubItem = React.forwardRef(_PopoverSubItem); */