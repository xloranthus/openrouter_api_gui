

import os, json
from models import LLM

def load_llms(llms_file):

    if not os.path.exists(llms_file):
        raise Exception('Cannot load LLMs. LLMs file does not exist.')

    llms: list[LLM] = []
    with open(llms_file, 'r') as f:
        for line in f:
            llm_dict = json.loads(line)
            llm = LLM(**llm_dict)
            llms.append(llm)

    if not llms:
        raise Exception('No LLMs to choose from.')

    return llms
