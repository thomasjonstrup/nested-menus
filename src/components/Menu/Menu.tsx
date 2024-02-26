import React, {
	ButtonHTMLAttributes,
	MutableRefObject,
	ReactElement,
	useLayoutEffect,
	useMemo,
	useRef
} from "react";
import { AriaMenuProps, MenuTriggerProps } from "@react-types/menu";
import { useMenuTriggerState } from "@react-stately/menu";
import { useTreeState } from "@react-stately/tree";
import { Key } from '@react-types/shared';
import { useButton } from "@react-aria/button";
import { FocusScope, useFocusRing } from "@react-aria/focus";
import { useMenu, useMenuItem, useMenuTrigger } from "@react-aria/menu";
import { useOverlayPosition } from "@react-aria/overlays";
import { mergeProps } from "@react-aria/utils";
import { useFocusableRef, useUnwrapDOMRef } from "@react-spectrum/utils";
import {
	FocusableRef,
	FocusStrategy,
	DOMRefValue,
	Node
} from "@react-types/shared";
import clsx from "clsx";
import { useHover } from "@react-aria/interactions";
import { TreeState } from "@react-stately/tree";

import { Popover } from "../Popover";
import styles from "./Menu.module.css";
import { PopoverSubItem } from "./SubMenu";

export type SapphireMenuProps<T extends object> = AriaMenuProps<T> &
	MenuTriggerProps & {
		renderTrigger: (
			props: ButtonHTMLAttributes<Element>,
			isOpen: boolean
		) => React.ReactNode;
		shouldFlip?: boolean
	};

interface MenuItemProps<T> {
	item: Node<T>;
	state: TreeState<T>;
	onAction?: (key: Key) => void;
	onClose: () => void;
	disabledKeys?: Iterable<Key>;
	menuRef: MutableRefObject<HTMLUListElement>
}

export function MenuItem<T>({
	item,
	state,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-expect-error
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	onAction,
	disabledKeys,
	onClose,
	menuRef
}: MenuItemProps<T>): JSX.Element {
	const ref = React.useRef<HTMLLIElement>(null);
	const isDisabled = disabledKeys && [...disabledKeys].includes(item.key);

	const onSubItemAction: (key: string | number) => void = (key) => {
		state.toggleKey(key);
	}

	const onSubItemChildAction: (key: string | number) => void = () => {
		state.expandedKeys.clear();
		state.setExpandedKeys(state.expandedKeys)
	}

	/**
	 * onCloseSubMenuItem
	 * -
	 * Function used to handling closing subMenu item
	 *
	 */
	const onCloseSubMenuItem: () => void = () => {
		state.expandedKeys.clear();
		state.setExpandedKeys(state.expandedKeys)
	}

	const { menuItemProps } = useMenuItem(
		{
			key: item.key,
			isDisabled,
			// When the menuItem has childNodes we want to use other action
			onAction: item.hasChildNodes ? onSubItemAction : onClose,
			onClose
		},
		state,
		ref
	);

	const memoItem = useMemo(() => {
		return item;
	}, [item]);

	const { hoverProps, isHovered } = useHover({ isDisabled });
	const { focusProps, isFocusVisible } = useFocusRing();

	const isMenuItemActive = state.expandedKeys.has(memoItem.key);

	return (
		<>
			<li
				{...mergeProps(menuItemProps, hoverProps, focusProps)}
				ref={ref}
				className={clsx(
					styles["sapphire-menu-item"],
					styles["js-focus"],
					styles["js-hover"],
					{
						[styles["is-disabled"]]: isDisabled,
						[styles["is-focus"]]: isFocusVisible,
						[styles["is-hover"]]: isHovered
					}
				)}
			>
				<p className={styles["sapphire-menu-item-overflow"]}>{memoItem.rendered}</p>
			</li>

			{/* Check if menu item has childNodes and if the key is defined in expandedKeys */}
			{memoItem.hasChildNodes && isMenuItemActive ? (
				<PopoverSubItem
					menuProps={menuItemProps}
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-expect-error
					state={state}
					menuRef={menuRef}
					ref={ref}
					open={isMenuItemActive}
					onClose={onCloseSubMenuItem}
				>
					{[...item.childNodes].map((item) => {
						if (item.type === "section") {
							throw new Error("Sections not supported");
						}
						return (
							<MenuItem
								key={item.key}
								item={item}
								state={state}
								menuRef={menuRef}
								onClose={() => onSubItemChildAction(item.key)}
								onAction={() => onSubItemChildAction(item.key)}
								disabledKeys={item.props.disabledKeys}
							/>
						);
					})}
				</PopoverSubItem>
			) : null}
		</>
	);
}

const MenuPopup = <T extends object>(
	props: {
		autoFocus: FocusStrategy;
		onClose: () => void;
	} & SapphireMenuProps<T>
) => {
	const state = useTreeState({ ...props, selectionMode: "multiple" });
	const menuRef = useRef<HTMLUListElement>(null);
	const { menuProps } = useMenu({
		...props
	}, state, menuRef);

	return (
		<ul {...menuProps} ref={menuRef} className={styles["sapphire-menu"]}>
			{[...state.collection].map((item) => {
				if (item.type === "section") {
					throw new Error("Sections not supported");
				}
				return (
					<MenuItem
						key={String(item.key)}
						item={item}
						state={state}
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-expect-error
						menuRef={menuRef}
						onClose={props.onClose}
						onAction={props.onAction}
						disabledKeys={props.disabledKeys}
					/>
				);
			})}
		</ul>
	);
};

const _Menu = <T extends object>(
	props: SapphireMenuProps<T>,
	ref: FocusableRef<HTMLButtonElement>
) => {
	const { renderTrigger, shouldFlip = true } = props;

	const state = useMenuTriggerState(props);
	const triggerRef = useFocusableRef<HTMLButtonElement>(ref);
	const popoverRef = useRef<DOMRefValue<HTMLDivElement>>(null);
	const unwrappedPopoverRef = useUnwrapDOMRef(popoverRef);
	const { menuTriggerProps, menuProps } = useMenuTrigger(
		props,
		state,
		triggerRef
	);
	const { buttonProps } = useButton(menuTriggerProps, triggerRef);

	const { overlayProps, updatePosition } = useOverlayPosition({
		targetRef: triggerRef,
		overlayRef: unwrappedPopoverRef,
		isOpen: state.isOpen,
		placement: "bottom start",
		offset: 6,
		onClose: state.close,
		shouldFlip
	});

	// Fixes an issue where menu with controlled open state opens in wrong place the first time
	useLayoutEffect(() => {
		if (state.isOpen) {
			requestAnimationFrame(() => {
				updatePosition();
			});
		}
	}, [state.isOpen, updatePosition]);

	return (
		<>
			{/*eslint-disable-next-line @typescript-eslint/ban-ts-comment*/}
			{/*@ts-expect-error*/}
			{renderTrigger({ ref: triggerRef, ...buttonProps }, state.isOpen)}
			<Popover
				isOpen={state.isOpen}
				ref={popoverRef}
				style={overlayProps.style ?? {}}
				className={clsx(styles["sapphire-menu-container"])}
				shouldCloseOnBlur
				onClose={state.close}
			>
				<FocusScope>
					{/*eslint-disable-next-line @typescript-eslint/ban-ts-comment*/}
					{/*@ts-expect-error*/}
					<MenuPopup
						{...mergeProps(props, menuProps)}
						autoFocus={state.focusStrategy || true}
						onClose={state.close}
					/>
				</FocusScope>
			</Popover>
		</>
	);
}

export const Menu = React.forwardRef(_Menu) as <T extends object>(
	props: SapphireMenuProps<T>,
	ref: FocusableRef<HTMLButtonElement>
) => ReactElement;