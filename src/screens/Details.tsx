import { useState, useEffect } from 'react'
import { Share } from 'react-native'
import { useToast, VStack, HStack } from "native-base";
import { useRoute } from "@react-navigation/native"

import { api } from '../services/api';

import { Header } from "../components/Header";
import { Loading } from '../components/Loading';
import { PoolCardPros } from '../components/PoolCard'
import { PoolHeader } from '../components/PoolHeader';
import { EmptyMyPoolList } from '../components/EmptyMyPoolList';
import { Option } from '../components/Option';
import { Guesses } from '../components/Guesses';

interface RouteParams {
  id: string;
}


export function Details() {
  const [optionSelected, setOptionSelected] = useState<'guesses' | 'ranking'>('guesses')
  const [isLoading, setIsLoading] = useState(true)
  const [pollDetails, setPollDetails] = useState<PoolCardPros>({} as PoolCardPros)

  const route = useRoute();
  const toast = useToast()
  const { id } = route.params as RouteParams;

  async function fetchPollDetails() {
    try {
      setIsLoading(true)
      const response = await api.get(`/polls/${id}`)
      setPollDetails(response.data.pool)

    } catch (error) {
      console.log(error)

      toast.show({
        title: 'Não foi possível carregar os detalhes do bolão',
        placement: 'top',
        bgColor: 'red.500'
      })

    } finally {
      setIsLoading(false)
    }
  }

  async function handleCodeShare(){
    await Share.share({
      message: pollDetails.code
    })
  }

  useEffect(() => {
    fetchPollDetails();
  }, [id])

  if (isLoading) {
    return (
      <Loading />
    )
  }


  return (
    <VStack flex={1} bgColor="gray.900">
      <Header
        title={pollDetails.title}
        showBackButton
        showShareButton
        onShare={handleCodeShare}
      />

      {
        pollDetails._count?.participant > 0 ?
          <VStack px={5} flex={1}>
            <PoolHeader data={pollDetails} />

            <HStack bgColor="gray.800" p={1} mb={5}>
              <Option
                title="Seus Palpites"
                isSelected={optionSelected === 'guesses' ? true : false}
                onPress={() => setOptionSelected('guesses')}
              />
              <Option
                title="Ranking do grupo"
                isSelected={optionSelected === 'ranking' ? true : false}
                onPress={() => setOptionSelected('ranking')}
              />
            </HStack>

            <Guesses pollId={pollDetails.id} code={pollDetails.code}/>

          </VStack>
          : <EmptyMyPoolList code={pollDetails.code} />
      }
    </VStack>
  )
}