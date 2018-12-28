import * as React from "react"
import { OrderedSet } from "immutable"
import { ContentState, ContentBlock, EditorBlock, CharacterMetadata } from "draft-js"

/**
 * @internal
 */
export interface BlockProps {
    alignment?: "left" | "center" | "right"
}

/**
 * @internal
 */
export interface TextBlockProps {
    block: ContentBlock
    contentState: ContentState
    blockProps: BlockProps
}

/**
 * @internal
 */
export class TextBlock extends React.Component<TextBlockProps, {}> {
    render() {
        const { block, blockProps } = this.props
        let styledBlock: ContentBlock | undefined

        // Empty block
        if (block.getLength() === 0) {
            // Modify the character list to make the block have a style.
            // This is a hack that relies on the characterList not being used
            // for anything else down the line.
            const emptyStyle = block.getData().get("emptyStyle", OrderedSet<string>())
            const emptyStyleCharacter = CharacterMetadata.create({ style: emptyStyle })
            const characterList = block.getCharacterList().insert(0, emptyStyleCharacter)
            styledBlock = block.set("characterList", characterList) as ContentBlock
        }

        const blockStyle: React.CSSProperties = {
            fontSize: "1px", // Reset to make sure line height of small font sizes is tight
            textAlign: blockProps.alignment,
        }

        return (
            <div style={blockStyle}>
                <EditorBlock {...this.props} block={styledBlock || block} />
            </div>
        )
    }
}

/**
 * @internal
 */
export const draftBlockRendererFunction = (editable: boolean, alignment?: "left" | "center" | "right") => {
    return (block: ContentBlock) => {
        return {
            component: TextBlock,
            props: { alignment },
            editable,
        }
    }
}
