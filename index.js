import { visit } from 'unist-util-visit';
import emoji from 'node-emoji';
import { emoticon } from 'emoticon';

const RE_EMOJI = /:\+1:|:-1:|:[\w-]+:/g;
const RE_SHORT = /[$@|*'",;.=:\-)([\]\\/<>038BOopPsSdDxXzZ]{2,5}/g;

const DEFAULT_SETTINGS = {
    padSpaceAfter: false,
    emoticon: false,
};

const IGNORED_NODES = ['link'];

export default function plugin(options) {
    const settings = Object.assign({}, DEFAULT_SETTINGS, options);
    const pad = !!settings.padSpaceAfter;
    const emoticonEnable = !!settings.emoticon;

    function getEmojiByShortCode(match) {
        const trimmedMatch = match ? match.trim() : match;
        // find emoji by shortcode - full match or with-out last char as it could be from text e.g. :-),
        const iconFull = emoticon.find((e) => e.emoticons.includes(trimmedMatch)); // full match
        const iconPart = emoticon.find((e) => e.emoticons.includes(trimmedMatch.slice(0, -1))); // second search pattern
        const trimmedChar = iconPart ? trimmedMatch.slice(-1) : '';
        const addPad = pad ? ' ' : '';
        let icon = iconFull
            ? iconFull.emoji + addPad
            : iconPart && iconPart.emoji + addPad + trimmedChar;
        return icon ? match.replace(trimmedMatch, icon) : match;
    }

    function getEmoji(match) {
        const got = emoji.get(match);
        if (pad && got !== match) {
            return got + ' ';
        }
        return got;
    }

    function transformer(tree) {
        visit(tree, 'text', function (node, index, parent) {
            if (!IGNORED_NODES.includes(parent.type)) {
                node.value = node.value.replace(RE_EMOJI, getEmoji);
                if (emoticonEnable) {
                    node.value = node.value.replace(RE_SHORT, getEmojiByShortCode);
                }
            }
        });
    }

    return transformer;
}
