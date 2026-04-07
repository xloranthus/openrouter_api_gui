
from models import Message, Chat, ChatWithMessages
from chatDAO import ChatDAO

CHATS_FILE = './chats.jsonl'
MESSAGES_DIR = './messages'

chatDAO = ChatDAO(CHATS_FILE, MESSAGES_DIR)

print(chatDAO.load_chats())

try:
    chatDAO.load_chat(0)
except Exception as e:
    print(e)

weight_loss_chat = chatDAO.add_chat('Weight loss tips')
harvest_parsley_chat = chatDAO.add_chat('How to harvest parsley')
etf_chat = chatDAO.add_chat('What are ETFs')

print(chatDAO.load_chats())

print(chatDAO.load_chat(weight_loss_chat))
print(chatDAO.load_chat(harvest_parsley_chat))
print(chatDAO.load_chat(etf_chat))

chatDAO.delete_chat(weight_loss_chat)

print(chatDAO.load_chats())

chatDAO.rename_chat(harvest_parsley_chat, 'How NOT to harvest parsley')

print(chatDAO.load_chat(harvest_parsley_chat))

chatDAO.add_message(harvest_parsley_chat, Message("user", "Hey, whassup?"))
chatDAO.add_message(harvest_parsley_chat, Message("assistant", "Hey, I'm fine, and you?"))
chatDAO.add_message(harvest_parsley_chat, Message("user", "Me too."))

print(chatDAO.load_chat(harvest_parsley_chat))
print(chatDAO.load_chat(etf_chat))

try:
    chatDAO.delete_chat(9)
except Exception as e:
    print(e)

try:
    chatDAO.delete_last_message(9)
except Exception as e:
    print(e)

chatDAO.delete_last_message(etf_chat)
chatDAO.delete_last_message(etf_chat)

print(chatDAO.load_chat(etf_chat))

chatDAO.delete_last_message(harvest_parsley_chat)
print(chatDAO.load_chat(harvest_parsley_chat))
chatDAO.delete_last_message(harvest_parsley_chat)
print(chatDAO.load_chat(harvest_parsley_chat))
chatDAO.delete_last_message(harvest_parsley_chat)
print(chatDAO.load_chat(harvest_parsley_chat))

