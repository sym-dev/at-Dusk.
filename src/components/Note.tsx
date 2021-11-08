import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
} from "@chakra-ui/accordion";
import { Avatar } from "@chakra-ui/avatar";
import { Button } from "@chakra-ui/button";
import { Icon } from "@chakra-ui/icon";
import { Image } from "@chakra-ui/image";
import { Box, Flex, HStack, Link, Text } from "@chakra-ui/layout";
import { Note as mkNote, User } from "misskey-js/built/entities";
import React, { memo } from "react";
import {
  IoArrowUndo,
  IoFastFood,
  IoHome,
  IoLockClosed,
  IoMail,
} from "react-icons/io5";
import { Link as RouterLink } from "react-router-dom";

import { NoteType } from "../features/notesSlice";
import { useColors } from "../utils/Colors";
import { getRelativeTime } from "../utils/getRelativeTime";

import { Files } from "./Files";
import { NoteFooter } from "./NoteFooter";
import { ParseMFM } from "./ParseMFM";
import { Reactions } from "./Reactions";

export const Note: React.VFC<{
  note: mkNote;
  type: NoteType;
  depth: number;
  colors: Record<string, string>;
}> = memo(
  function Fn({ note, type, depth, colors }) {
    const name = note.user.name ? note.user.name : note.user.username;
    const [cw, updateCw] = React.useState(
      type.type === "renote"
        ? note.renote?.cw || note.renote?.cw === ""
          ? true
          : false
        : note.cw || note.cw === ""
        ? true
        : false
    );
    return (
      <Box
        p="2"
        borderRadius="lg"
        overflow="hidden"
        bgColor={colors.panelColor}
        color={colors.textColor}
      >
        {type.type === "note" && (
          <GeneralNote
            note={note}
            name={name}
            depth={depth}
            cw={cw}
            updateCw={updateCw}
            colors={colors}
          />
        )}
        {type.type === "reply" && (
          <Reply
            note={note}
            name={name}
            cw={cw}
            updateCw={updateCw}
            colors={colors}
          />
        )}
        {type.type === "renote" && (
          <Renote
            note={note}
            name={name}
            cw={cw}
            updateCw={updateCw}
            colors={colors}
          />
        )}
        {type.type === "quote" && (
          <Quote
            note={note}
            name={name}
            depth={depth}
            cw={cw}
            updateCw={updateCw}
            colors={colors}
          />
        )}
        <Reactions
          id={type.type === "renote" ? (note.renote?.id as string) : note.id}
        />
        <NoteFooter note={note} type={type} colors={colors} />
      </Box>
    );
  },
  (p, n) => p.note.id === n.note.id && p.colors === n.colors
);

const GeneralNote: React.VFC<{
  note: mkNote;
  name: string;
  depth: number;
  cw: boolean;
  updateCw: React.Dispatch<React.SetStateAction<boolean>>;
  colors: Record<string, string>;
}> = memo(function Fn({ note, name, depth, cw, updateCw, colors }) {
  const alpha = useColors("alpha");
  return (
    <>
      <Flex>
        <Link
          as={RouterLink}
          to={`/user/@${note.user.username}${
            note.user.host ? `@${note.user.host}` : ""
          }`}
        >
          <Avatar
            name={note.user.username}
            src={note.user.avatarUrl}
            marginRight="2"
            bg="none"
          />
        </Link>
        <Box overflow="hidden" flex="1">
          <Flex alignItems="center" justifyContent="space-between">
            <Flex alignItems="center" overflow="hidden">
              <Link
                as={RouterLink}
                to={`/user/@${note.user.username}${
                  note.user.host ? `@${note.user.host}` : ""
                }`}
                isTruncated
              >
                <ParseMFM text={name} emojis={note.user.emojis} type="plain" />
              </Link>
              <Text color="gray.400" isTruncated>{`@${note.user.username}${
                note.user.host ? `@${note.user.host}` : ""
              }`}</Text>
            </Flex>
            <HStack flexShrink={0} spacing="1">
              <Link as={RouterLink} to={`/notes/${note.id}`} color="gray.400">
                {getRelativeTime(note.createdAt)}
              </Link>
              <Visibility
                visibility={note.visibility}
                local={note.localOnly}
                renote={false}
              />
            </HStack>
          </Flex>
          {note.user.host && depth === 0 && <Instance user={note.user} />}
          <Box>
            {note.cw || note.cw === "" ? (
              <>
                <HStack>
                  {note.replyId && <Icon as={IoArrowUndo} />}
                  <Box>
                    <Box
                      whiteSpace="pre-wrap"
                      wordBreak="break-word"
                      display="inline"
                    >
                      <ParseMFM
                        text={note.cw}
                        emojis={note.emojis}
                        type="full"
                      />
                    </Box>
                    <Button
                      marginLeft="1"
                      size="xs"
                      color={colors.headerTextColor}
                      colorScheme="whiteAlpha"
                      onClick={() => {
                        updateCw(!cw);
                      }}
                    >
                      {!cw ? "隠す" : `もっと見る (${note.text?.length}文字)`}
                    </Button>
                  </Box>
                </HStack>
                {!cw && (
                  <Box paddingInline="1" w="full">
                    <Box
                      whiteSpace="pre-wrap"
                      wordBreak="break-word"
                      display="inline"
                      w="full"
                    >
                      <ParseMFM
                        text={note.text}
                        emojis={note.emojis}
                        type="full"
                      />
                    </Box>
                    {note.renoteId && note.renote?.text && (
                      <Text marginLeft="1" color="green.400" display="inline">
                        <i>RN:</i>
                      </Text>
                    )}
                  </Box>
                )}
              </>
            ) : (
              <HStack>
                {note.replyId && <Icon as={IoArrowUndo} />}
                <Box paddingInline="1" w="full">
                  <Box
                    whiteSpace="pre-wrap"
                    wordBreak="break-word"
                    display="inline"
                    w="full"
                  >
                    <ParseMFM
                      text={note.text}
                      emojis={note.emojis}
                      type="full"
                    />
                  </Box>
                  {note.renoteId && note.renote?.text && (
                    <Text marginLeft="1" color="green.400" display="inline">
                      <i>RN:</i>
                    </Text>
                  )}
                </Box>
              </HStack>
            )}
          </Box>
        </Box>
      </Flex>
      {!cw && note.files.length > 0 && (
        <>
          {depth === 0 ? (
            <Files files={note.files} colors={colors} />
          ) : (
            <Accordion allowToggle m="1">
              <AccordionItem border="none">
                <AccordionButton w="fit-content" bgColor={alpha.alpha200}>
                  <AccordionIcon />
                  {`${note.files.length}個のファイル`}
                </AccordionButton>
                <AccordionPanel>
                  <Files files={note.files} colors={colors} />
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          )}
        </>
      )}
    </>
  );
});

const Reply: React.VFC<{
  note: mkNote;
  name: string;
  cw: boolean;
  updateCw: React.Dispatch<React.SetStateAction<boolean>>;
  colors: Record<string, string>;
}> = memo(function Fn({ note, name, cw, updateCw, colors }) {
  return (
    <Box>
      <Box
        border="1.5px dashed"
        borderColor={colors.secondaryColor}
        borderRadius="lg"
        marginBottom="2"
        paddingInline="1"
        paddingBlock="2"
        opacity="0.6"
      >
        <GeneralNote
          note={note.reply as mkNote}
          name={
            note.reply?.user.name
              ? note.reply.user.name
              : (note.reply?.user.username as string)
          }
          depth={1}
          cw={cw}
          updateCw={updateCw}
          colors={colors}
        />
      </Box>
      {note.renoteId ? (
        <Box overflow="hidden">
          <Quote
            note={note}
            name={name}
            depth={0}
            cw={cw}
            updateCw={updateCw}
            colors={colors}
          />
        </Box>
      ) : (
        <Box overflow="hidden">
          <GeneralNote
            note={note}
            name={name}
            depth={0}
            cw={cw}
            updateCw={updateCw}
            colors={colors}
          />
        </Box>
      )}
    </Box>
  );
});

const Renote: React.VFC<{
  note: mkNote;
  name: string;
  cw: boolean;
  updateCw: React.Dispatch<React.SetStateAction<boolean>>;
  colors: Record<string, string>;
}> = memo(function Fn({ note, name, cw, updateCw, colors }) {
  return (
    <Box>
      {note.renote?.replyId && (
        <Box marginBottom="1" opacity="0.7">
          {note.renote?.renoteId ? (
            <Box overflow="hidden">
              <Quote
                note={note.renote.reply as mkNote}
                name={
                  note.renote?.reply?.user.name
                    ? note.renote.reply.user.name
                    : (note.renote?.reply?.user.username as string)
                }
                depth={1}
                cw={cw}
                updateCw={updateCw}
                colors={colors}
              />
            </Box>
          ) : (
            <Box overflow="hidden">
              <GeneralNote
                note={note.renote.reply as mkNote}
                name={
                  note.renote?.reply?.user.name
                    ? note.renote.reply.user.name
                    : (note.renote?.reply?.user.username as string)
                }
                depth={1}
                cw={cw}
                updateCw={updateCw}
                colors={colors}
              />
            </Box>
          )}
        </Box>
      )}
      <Flex alignItems="center" justifyContent="space-between" marginBottom="2">
        <Flex overflow="hidden">
          <Avatar
            name={note.user.username}
            src={note.user.avatarUrl}
            size="xs"
            marginRight="1"
            bg="none"
          />
          <Box color="green.400" isTruncated>
            <Link
              as={RouterLink}
              to={`/user/@${note.user.username}${
                note.user.host ? `@${note.user.host}` : ""
              }`}
            >
              <ParseMFM text={name} emojis={note.user.emojis} type="plain" />
            </Link>
            がRenote
          </Box>
        </Flex>
        <HStack spacing="1" flexShrink={0}>
          <Link as={RouterLink} to={`/notes/${note.id}`} color="green.400">
            {getRelativeTime(note.createdAt)}
          </Link>
          <Box color="green.400">
            <Visibility
              visibility={note.visibility}
              local={note.localOnly}
              renote={true}
            />
          </Box>
        </HStack>
      </Flex>
      {note.renote?.renoteId ? (
        <Box overflow="hidden">
          <Quote
            note={note.renote as mkNote}
            name={
              note.renote?.user.name
                ? note.renote.user.name
                : (note.renote?.user.username as string)
            }
            depth={0}
            cw={cw}
            updateCw={updateCw}
            colors={colors}
          />
        </Box>
      ) : (
        <Box overflow="hidden">
          <GeneralNote
            note={note.renote as mkNote}
            name={
              note.renote?.user.name
                ? note.renote.user.name
                : (note.renote?.user.username as string)
            }
            depth={0}
            cw={cw}
            updateCw={updateCw}
            colors={colors}
          />
        </Box>
      )}
    </Box>
  );
});

const Quote: React.VFC<{
  note: mkNote;
  name: string;
  depth: number;
  cw: boolean;
  updateCw: React.Dispatch<React.SetStateAction<boolean>>;
  colors: Record<string, string>;
}> = memo(function Fn({ note, name, depth, cw, updateCw, colors }) {
  return (
    <Box>
      <GeneralNote
        note={note}
        name={name}
        depth={0}
        cw={cw}
        updateCw={updateCw}
        colors={colors}
      />
      {!((note.cw || note.cw === "") && cw) && depth === 0 && (
        <Box
          marginTop="1"
          paddingInline="1"
          paddingBlock="2"
          borderRadius="lg"
          border="1.5px dashed"
          borderColor={colors.borderColor}
        >
          <GeneralNote
            note={note.renote as mkNote}
            name={
              note.renote?.user.name
                ? note.renote.user.name
                : (note.renote?.user.username as string)
            }
            depth={1}
            cw={cw}
            updateCw={updateCw}
            colors={colors}
          />
        </Box>
      )}
    </Box>
  );
});

const Instance: React.VFC<{
  user: User;
}> = memo(function Fn({ user }) {
  const alpha = useColors("alpha");
  return (
    <>
      <Flex
        bgGradient={`linear(to-r, ${
          user.instance?.themeColor ? user.instance.themeColor : alpha.alpha600
        }, #00000000)`}
        paddingLeft="1"
        borderRadius="md"
        alignItems="center"
      >
        <Image
          src={user.instance?.faviconUrl as string}
          h="5"
          marginRight="1"
        />
        <Text color="white">{user.instance?.name}</Text>
      </Flex>
    </>
  );
});

const Visibility: React.VFC<{
  visibility: "public" | "home" | "followers" | "specified";
  local: boolean | undefined;
  renote: boolean;
}> = memo(function Fn({ visibility, local, renote }) {
  let v = null;
  switch (visibility) {
    case "home":
      v = <Icon as={IoHome} color={renote ? "green.400" : "gray.400"} />;
      break;
    case "followers":
      v = <Icon as={IoLockClosed} color={renote ? "green.400" : "gray.400"} />;
      break;
    case "specified":
      v = <Icon as={IoMail} color={renote ? "green.400" : "gray.400"} />;
      break;
    default:
      break;
  }
  return (
    <HStack spacing="1">
      {local && (
        <Icon as={IoFastFood} color={renote ? "green.400" : "gray.400"} />
      )}
      {v}
    </HStack>
  );
});
