<script setup>
import {Button} from "@/components/ui/button/index.js";
import {Input} from '@/components/ui/input/index.js'
import {ref} from "vue";
import axios from 'redaxios';
import {toast} from "vue-sonner";
import {ClipboardCheck, ClipboardCopy, FileDown, Loader2} from 'lucide-vue-next';
import {useClipboard, useMediaQuery} from '@vueuse/core'
import {useLogto} from '@logto/vue';
import {eventBus} from "@/lib/eventBus.js";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip/index.js'
import {API} from "@/lib/apiRouteMap.js";

const { getAccessToken } = useLogto()

const props = defineProps({
  mfaMethods: {type: Object, required: true}
})

const removeFooter = defineModel()

const isLoading = ref(false);
const mfaSetup = ref(false);
const cantScan = ref(false);
const appMfaData = ref({});
const backupSetup = ref(false);
const { copy, copied } = useClipboard({ appMfaData })

async function setupAppAuthenticator() {
  removeFooter.value = true;
  isLoading.value = true;
  try {
    const response = await axios.post(
        API.MFA.CREATE,
        {},
        { headers: {
            Authorization: `Bearer ${await getAccessToken(import.meta.env.VITE_LOGTO_CORE_RESOURCE)}`,
            'Content-Type': 'application/json'
          } }
    )
    if (response.status === 200) {
      appMfaData.value = response.data;
      mfaSetup.value = true;
      toast.info('Action Completed Successfully', { description: 'A new app authenticator has been generated successfully.' })
    }
  } catch (error) {
    toast.error('Unable to complete action:', {
      description: 'Service Unavailable. Try again later'
    });
  } finally {
    isLoading.value = false;
  }
}

async function deleteAppAuthenticator() {
  console.log(props.mfaMethods)
  isLoading.value = true;
  try {
    const response = await axios.post(
        API.MFA.REMOVE,
        {
          "appid": props.mfaMethods.totp.id,
          "backupid": props.mfaMethods.backup.id,
        },
        { headers: {Authorization: `Bearer ${await getAccessToken(import.meta.env.VITE_LOGTO_CORE_RESOURCE)}`, 'Content-Type': 'application/json'}}
    )
    if (response.status === 204) {
      toast.success('Action Completed Successfully', { description: 'Connected App Authenticator and Backup Codes were removed from your account.' })
      complete()
    }
  } catch (error) {
    console.log(error)
    toast.error('Unable to complete action:', {
      description: 'Service Unavailable. Try again later'
    });
  } finally {
    isLoading.value = false;
  }
}

const generateDownloadLink = () => {
  const blob = new Blob([appMfaData.value.BackupCodes.codes], { type: 'text/plain' });
  return URL.createObjectURL(blob);
};

const downloadFile = () => {
  const link = document.createElement('a');
  link.href = generateDownloadLink();
  link.download = 'backupcodes-Keep In A Safe Place!.txt';
  link.click();
  URL.revokeObjectURL(link.href);
};

function complete() {
  eventBus.emit('closeEditDetailDialog', false)
  if (isDesktop) {eventBus.emit('refreshUserData', true)}
}
const isDesktop = useMediaQuery('(min-width: 1023px)')
</script>

<template>
  <div class="space-y-3 flex flex-col items-center mt-[-30px] mb-10">
    <p class="text-sm desktop:w-2/3 tablet:w-full text-center" v-if="Boolean(!mfaMethods.totp) && !mfaSetup">
      Use a app authenticator to greatly increase the security of your account. Some popular 2FA solutions are Google/Microsoft Authenticator.
    </p>
    <div v-if="mfaMethods.totp" class="flex flex-col items-center gap-y-2">
      <p>You currently have a App Authenticator setup.</p>
      <p class="text-xs">Created at {{ mfaMethods.totp.createdAt }}</p>
      <Button variant="destructive" class="desktop:h-[30px] tablet:w-full" :disabled="isLoading" @click="deleteAppAuthenticator">
        <Loader2 v-if="isLoading" class="w-4 h-4 mr-2 animate-spin" color="black" />
        Remove Authenticator
      </Button>
    </div>
    <div v-else>
      <div v-if="!mfaSetup">
        <Button class="desktop:h-[30px]" @click="setupAppAuthenticator" :disabled="isLoading">
          <Loader2 v-if="isLoading" class="w-4 h-4 mr-2 animate-spin" color="black" />
          {{ isLoading ? 'Generating...' : 'Setup App Authenticator' }}
        </Button>
      </div>
      <div v-else-if="!backupSetup" class="flex flex-col items-center gap-y-2">
        <p class="text-lg font-bold tablet:text-center">Add the {{ cantScan ? 'Secret' : 'QR Code' }} to your Authenticator App</p>
        <div class="flex flex-col items-center">
          <img :src="appMfaData.AppAuthenticator.secretQrCode" alt="mfaqrcode" v-if="!cantScan" />
          <div class="flex w-full max-w-sm items-center gap-1.5" v-else>
            <Input :value="appMfaData.AppAuthenticator.secret" :default-value="appMfaData.AppAuthenticator.secret" />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Button type="submit" @click="copy(appMfaData.AppAuthenticator.secret)">
                    <component :is="copied ? ClipboardCheck : ClipboardCopy" color="black" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{{ copied ? 'Copied' : 'Copy' }}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Button variant="link" class="text-xs" @click="() => cantScan = !cantScan">
            {{ cantScan ? "Show QR Code" : "Cant Scan the QR Code?" }}
          </Button>
        </div>
        <Button class="desktop:h-[30px]" @click="() => backupSetup = true">
          Complete Setup
        </Button>
      </div>
        <div v-else class="flex flex-col items-center gap-y-2">
          <p class="text-lg font-bold tablet:text-center">Save your Backup Codes in a safe place!</p>
          <p class="text-xs">You will only see these once</p>
          <div class="flex items-center gap-x-1">
            <Button type="submit" @click="downloadFile" class="desktop:h-[30px]">
              <FileDown color="black" class="pr-1" />
              Download Codes
            </Button>
            <Button type="submit" @click="copy(appMfaData.BackupCodes.codes)" variant="secondary" class="desktop:h-[30px]">
              <component :is="copied ? ClipboardCheck : ClipboardCopy" color="black" class="pr-1" />
              {{ copied ? 'Copied!' : 'Copy to Clipboard' }}
            </Button>
          </div>
          <Button class="desktop:h-[30px] tablet:w-full mt-14" @click="complete">
            Finish
          </Button>
        </div>
    </div>
  </div>
</template>