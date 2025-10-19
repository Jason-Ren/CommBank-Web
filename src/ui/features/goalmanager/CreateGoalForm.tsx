import { faCalendarAlt, faDollarSign, faSmile } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date'
import 'date-fns'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { createGoal as createGoalApi } from '../../../api/lib'
import { createGoal as createGoalRedux } from '../../../store/goalsSlice'
import { useAppDispatch } from '../../../store/hooks'
import {
  setIsOpen as setIsOpenRedux,
  setContent as setContentRedux,
  setType as setTypeRedux,
} from '../../../store/modalSlice'
import DatePicker from '../../components/DatePicker'
import EmojiPicker from '../../components/EmojiPicker'
import { Theme } from '../../components/Theme'
import { TransparentButton } from '../../components/TransparentButton'

export function CreateGoalForm() {
  const dispatch = useAppDispatch()

  const [name, setName] = useState<string>('')
  const [targetDate, setTargetDate] = useState<Date | null>(new Date())
  const [targetAmount, setTargetAmount] = useState<number | null>(null)
  const [icon, setIcon] = useState<string | null>(null)
  const [emojiPickerIsOpen, setEmojiPickerIsOpen] = useState<boolean>(false)

  const hasIcon = () => icon != null

  const addIconOnClick = (event: React.MouseEvent) => {
    event.stopPropagation()
    setEmojiPickerIsOpen(true)
  }

  const handleEmojiSelect = (emoji: any) => {
    setIcon(emoji.native)
    setEmojiPickerIsOpen(false)
  }

  const closeEmojiPicker = () => {
    setEmojiPickerIsOpen(false)
  }

  const removeIcon = () => {
    setIcon(null)
  }

  const handleCreateGoal = async () => {
    if (!name.trim() || !targetDate || !targetAmount) {
      alert('Please fill in all required fields')
      return
    }

    const goal = await createGoalApi(icon)
    
    if (goal != null) {
      dispatch(createGoalRedux(goal))
      dispatch(setContentRedux(goal))
      dispatch(setTypeRedux('Goal'))
      // Keep modal open to show the created goal
    }
  }

  const handleCancel = () => {
    dispatch(setIsOpenRedux(false))
  }

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerIsOpen) {
        const target = event.target as Element
        if (!target.closest('[data-emoji-picker]')) {
          setEmojiPickerIsOpen(false)
        }
      }
    }

    if (emojiPickerIsOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [emojiPickerIsOpen])

  return (
    <CreateGoalContainer>
      <Title>Create New Goal</Title>
      
      <NameInput 
        value={name} 
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter goal name..."
      />

      <Group>
        <Field name="Target Date" icon={faCalendarAlt} />
        <Value>
          <DatePicker value={targetDate} onChange={setTargetDate} />
        </Value>
      </Group>

      <Group>
        <Field name="Target Amount" icon={faDollarSign} />
        <Value>
          <StringInput 
            value={targetAmount ?? ''} 
            onChange={(e) => setTargetAmount(parseFloat(e.target.value) || null)}
            placeholder="Enter amount..."
          />
        </Value>
      </Group>

      <IconSection>
        {hasIcon() ? (
          <CurrentIconContainer>
            <CurrentIcon>{icon}</CurrentIcon>
            <IconActions>
              <ChangeIconButton onClick={addIconOnClick}>
                <FontAwesomeIcon icon={faSmile} size="1x" />
                <span>Change</span>
              </ChangeIconButton>
              <RemoveIconButton onClick={removeIcon}>
                <span>×</span>
              </RemoveIconButton>
            </IconActions>
          </CurrentIconContainer>
        ) : (
          <AddIconButtonContainer hasIcon={hasIcon()}>
            <TransparentButton onClick={addIconOnClick} />
              <FontAwesomeIcon icon={faSmile} size="2x" />
              <AddIconButtonText>Add icon (optional)</AddIconButtonText>
            <TransparentButton />
          </AddIconButtonContainer>
        )}
      </IconSection>

      {emojiPickerIsOpen && (
        <EmojiPickerContainer isOpen={emojiPickerIsOpen} hasIcon={hasIcon()} data-emoji-picker>
          <EmojiPicker onClick={handleEmojiSelect} />
          <CloseButton onClick={closeEmojiPicker}>×</CloseButton>
        </EmojiPickerContainer>
      )}

      <ButtonGroup>
        <CancelButton onClick={handleCancel}>Cancel</CancelButton>
        <CreateButton onClick={handleCreateGoal}>Create Goal</CreateButton>
      </ButtonGroup>
    </CreateGoalContainer>
  )
}

type FieldProps = { name: string; icon: any }
type AddIconButtonContainerProps = { hasIcon: boolean }
type EmojiPickerContainerProps = { isOpen: boolean; hasIcon: boolean }

const Field = (props: FieldProps) => (
  <FieldContainer>
    <FontAwesomeIcon icon={props.icon} size="2x" />
    <FieldName>{props.name}</FieldName>
  </FieldContainer>
)

const CreateGoalContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  height: 100%;
  width: 100%;
  position: relative;
`

const Title = styled.h1`
  font-size: 3rem;
  font-weight: bold;
  color: ${({ theme }: { theme: Theme }) => theme.text};
  margin-bottom: 2rem;
`

const Group = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  margin-top: 1.25rem;
  margin-bottom: 1.25rem;
`

const NameInput = styled.input`
  display: flex;
  background-color: transparent;
  outline: none;
  border: none;
  font-size: 4rem;
  font-weight: bold;
  color: ${({ theme }: { theme: Theme }) => theme.text};
  width: 100%;
  margin-bottom: 1rem;

  &::placeholder {
    color: rgba(174, 174, 174, 0.5);
  }
`

const FieldName = styled.h1`
  font-size: 1.8rem;
  margin-left: 1rem;
  color: rgba(174, 174, 174, 1);
  font-weight: normal;
`

const FieldContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 20rem;

  svg {
    color: rgba(174, 174, 174, 1);
  }
`

const StringInput = styled.input`
  display: flex;
  background-color: transparent;
  outline: none;
  border: none;
  font-size: 1.8rem;
  font-weight: bold;
  color: ${({ theme }: { theme: Theme }) => theme.text};

  &::placeholder {
    color: rgba(174, 174, 174, 0.5);
  }
`

const Value = styled.div`
  margin-left: 2rem;
`

const IconSection = styled.div`
  margin-top: 2rem;
  width: 100%;
`

const AddIconButtonContainer = styled.div<AddIconButtonContainerProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 2rem;
  padding: 1rem;
  border: 2px dashed rgba(174, 174, 174, 0.5);
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: rgba(174, 174, 174, 0.8);
  }
`

const AddIconButtonText = styled.span`
  margin-top: 0.5rem;
  color: rgba(174, 174, 174, 1);
  font-size: 1.2rem;
`

const CurrentIconContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  border: 2px solid rgba(174, 174, 174, 0.3);
  border-radius: 8px;
  background: rgba(174, 174, 174, 0.05);
`

const CurrentIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
`

const IconActions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`

const ChangeIconButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${({ theme }: { theme: Theme }) => theme.background};
  border: 1px solid rgba(174, 174, 174, 0.5);
  border-radius: 6px;
  padding: 0.5rem 1rem;
  color: ${({ theme }: { theme: Theme }) => theme.text};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;

  &:hover {
    border-color: rgba(174, 174, 174, 0.8);
    background: rgba(174, 174, 174, 0.1);
  }

  svg {
    color: rgba(174, 174, 174, 1);
  }
`

const RemoveIconButton = styled.button`
  background: #ff4757;
  border: none;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
  transition: background-color 0.2s ease;

  &:hover {
    background: #ff3742;
  }
`

const EmojiPickerContainer = styled.div<EmojiPickerContainerProps>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  background: ${({ theme }: { theme: Theme }) => theme.background};
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 2rem;
  color: ${({ theme }: { theme: Theme }) => theme.text};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 3rem;
  width: 100%;
  justify-content: flex-end;
`

const CancelButton = styled.button`
  background: transparent;
  border: 1px solid rgba(174, 174, 174, 0.5);
  border-radius: 8px;
  padding: 1rem 2rem;
  color: ${({ theme }: { theme: Theme }) => theme.text};
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(174, 174, 174, 0.8);
    background: rgba(174, 174, 174, 0.1);
  }
`

const CreateButton = styled.button`
  background: #007bff;
  border: none;
  border-radius: 8px;
  padding: 1rem 2rem;
  color: white;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
  transition: background-color 0.2s ease;

  &:hover {
    background: #0056b3;
  }
`
